import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { CreateOrderDTO } from './dto/create-order.dto';
import { ORDER_STATUS, PAYMENT_STATUS, WS_MESSAGE_TYPE } from 'src/shared/enums';
import { CreatePaymentResponseDto } from '../payment/dto/create-payment-response.dto';
import { ShoppingCartItem } from 'src/shopping-cart/shopping-cart-item.model';
import { Op } from 'sequelize';
import { PaymentsService } from 'src/payment/payments.service';
import { ShoppingCart } from 'src/shopping-cart/shopping-cart.model';
import { OrderItem } from './order-item.model';
import { Product } from 'src/products/product.model';
import { PaginationResponse } from 'src/shared/types/pagination-response';
import { PaginationRequestQuery } from 'src/shared/types';
import { Category } from 'src/categories/category.model';
import { FileModel } from 'src/files/file.model';
import { NotificationService } from 'src/websockets/notification/notification.service';
import { User } from 'src/users/users.model';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { OrderStats } from './order-stats.model';
import { formatPhoneNumber } from 'src/shared/utils/phone-format.utils';
import { ClientAppConfigService } from 'src/client-app-config/client-app-config.service';
import { ProductService } from 'src/products/products.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(OrderItem) private readonly orderItemModel: typeof OrderItem,
    @InjectModel(ShoppingCart) private readonly shoppingCartModel: typeof ShoppingCart,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(OrderStats) private readonly orderStatsModel: typeof OrderStats,
    @InjectModel(ShoppingCartItem) private readonly shoppingCartItemModel: typeof ShoppingCartItem,
    private readonly paymentService: PaymentsService,
    private readonly notificationService: NotificationService,
    private readonly clientAppConfigService: ClientAppConfigService,
    private readonly productsService: ProductService, // 👈 вот здесь
  ) {}

  private async findLastOrderRaw(userId: string): Promise<Order | null> {
    return this.orderModel.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  private async getCart(userId: string, transaction: any): Promise<ShoppingCart> {
    const cart = await this.shoppingCartModel.findOne({
      where: { userId },
      include: [{ model: ShoppingCartItem, include: [{ model: Product }] }],
      transaction,
    });

    if (!cart || !cart.items.length) {
      throw new NotFoundException('Корзина пуста или не найдена. Добавьте товары перед оформлением заказа.');
    }

    return cart;
  }

  private async createOrderItems(orderId: string, items: ShoppingCartItem[], transaction: any): Promise<void> {
    for (const item of items) {
      await this.orderItemModel.create(
        {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        },
        { transaction },
      );
    }
  }

  async createOrder({
    userId,
    returnUrl,
    comment,
    address,
    phoneNumber,
    name,
  }: { userId: string } & CreateOrderDTO): Promise<CreatePaymentResponseDto> {
    const transaction = await this.orderModel.sequelize.transaction();

    try {
      const lastOrder = await this.findLastOrderRaw(userId);
      if (
        lastOrder &&
        lastOrder.orderStatus !== ORDER_STATUS.DELIVERED &&
        lastOrder.orderStatus !== ORDER_STATUS.REFUNDED
      ) {
        throw new Error('Дождитесь завершения предыдущего заказа.');
      }

      const cart = await this.getCart(userId, transaction);
      phoneNumber = formatPhoneNumber(phoneNumber);

      const order = await this.orderModel.create(
        {
          userId,
          totalPrice: cart.totalPrice,
          quantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          orderStatus: ORDER_STATUS.AWAITING_PAYMENT,
          paymentStatus: PAYMENT_STATUS.PENDING,
          phoneNumber,
          name,
        },
        { transaction },
      );

      await this.createOrderItems(order.id, cart.items, transaction);

      const config = await this.clientAppConfigService.getConfig();
      let deliveryItem = null;

      if (
        config?.freeDeliveryIncluded &&
        cart.totalPrice < config.freeDeliveryThreshold &&
        config.averageDeliveryCost > 0
      ) {
        const deliveryProduct = await this.productsService.getProductById(process.env.DELIVERY_PRODUCT_ID);
        if (!deliveryProduct) {
          throw new NotFoundException('Продукт "Доставка" не найден.');
        }

        deliveryItem = await this.orderItemModel.create(
          {
            orderId: order.id,
            productId: deliveryProduct.id,
            quantity: 1,
            price: config.averageDeliveryCost,
          },
          { transaction },
        );

        order.totalPrice += config.averageDeliveryCost;
        order.quantity += 1;
        await order.save({ transaction });
      }

      const user = await this.userModel.findByPk(userId, { transaction });

      const items = await this.orderItemModel.findAll({
        where: { orderId: order.id },
        include: [{ model: Product }],
        transaction,
      });

      for (const item of items) {
        const orderDate = order.createdAt.toISOString().split('T')[0];

        const existingStats = await this.orderStatsModel.findOne({
          where: {
            ['product.title']: item.product.title,
            ['order_date']: orderDate,
          },
        });

        if (existingStats) {
          await this.orderStatsModel.update(
            {
              product: {
                price: {
                  value: (Number(existingStats.product.price.value) + Number(item.price)).toFixed(2),
                  currency: 'RUB',
                },
                title: existingStats.product.title,
                quantity: existingStats.product.quantity + item.quantity,
              },
            },
            {
              where: {
                ['product.title']: item.product.title,
                order_date: orderDate,
              },
            },
          );
        } else {
          await this.orderStatsModel.create({
            orderDate: orderDate,
            product: {
              price: {
                value: item.price.toFixed(2),
                currency: 'RUB',
              },
              title: item.product.title,
              quantity: item.quantity,
            },
          });
        }
      }

      const paymentResult = await this.paymentService.createPayment({
        amount: order.totalPrice.toString(),
        currency: 'RUB',
        description: `Оплата за заказ ${order.id}`,
        returnUrl,
        metadata: { order_id: order.id },
        user,
        items,
      });

      order.transactionId = paymentResult.id;
      order.paymentStatus = PAYMENT_STATUS.PENDING;
      order.paymentUrl = paymentResult.confirmation.confirmation_url;
      order.comment = comment;
      order.address = address;

      await order.save({ transaction });

      await this.shoppingCartItemModel.destroy({ where: { shoppingCartId: cart.id }, transaction });
      await cart.update({ totalPrice: 0, quantity: 0 }, { transaction });
      await transaction.commit();

      await this.notificationService.sendNotificationToAdmin<Order>({
        type: WS_MESSAGE_TYPE.NEW_ORDER,
        payload: order,
      });

      await this.notificationService.sendUserNotification<Order>({
        recipientUserIds: [user.id],
        message: {
          type: WS_MESSAGE_TYPE.NEW_ORDER,
          payload: order,
        },
      });

      return order.toJSON() as CreatePaymentResponseDto;
    } catch (error) {
      await transaction.rollback();
      throw new NotFoundException(`Ошибка при создании заказа или инициации платежа: ${String(error)}`);
    }
  }

  async findLastOrder(userId: number): Promise<Order> {
    const order = await this.orderModel.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']], // Находим последний заказ
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: FileModel, as: 'images' }, { model: Category }], // Включаем изображения и категорию
            },
          ],
        },
        {
          model: User,
          attributes: ['id', 'fullName', 'phoneNumber', 'email'], // необязательно, но лучше явно указать
        },
      ],
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден.');
    }

    // Преобразуем в JSON, чтобы исключить циклические ссылки
    const plainOrder = order.toJSON();

    // Агрегируем информацию о товарах
    const items = plainOrder.items.map((item) => ({
      product: {
        id: item.product?.id,
        title: item.product?.title,
        price: item.product?.price,
        description: item.product?.description,
        category: item.product?.category?.title || 'Другое',
        images: item.product?.images, // Включаем изображения
      },
      quantity: item.quantity,
      totalPrice: item.quantity * item.product?.price,
    }));

    return {
      id: plainOrder.id,
      totalPrice: plainOrder.totalPrice,
      quantity: plainOrder.quantity,
      orderStatus: plainOrder.orderStatus,
      paymentStatus: plainOrder.paymentStatus,
      transactionId: plainOrder.transactionId,
      createdAt: plainOrder.createdAt,
      paymentUrl: plainOrder.paymentUrl,
      comment: plainOrder.comment,
      address: plainOrder.address,
      items, // Включаем агрегированные товары
    } as unknown as Order;
  }

  async findAllOrders({
    page = 1,
    limit = 10,
    search,
    startDate,
    endDate,
    status,
    sort = 'createdAt',
    order = 'ASC',
    userId,
  }: PaginationRequestQuery & {
    userId?: number;
    startDate?: string;
    endDate?: string;
    status?: ORDER_STATUS[];
  }): Promise<PaginationResponse<Order>> {
    const offset = (page - 1) * limit;

    const whereCondition: any = {};

    // 🔍 Фильтр по ID заказа (если в search пришёл валидный UUID)
    if (search?.trim()) {
      const trimmed = search.trim();
      if (validateUUID(trimmed)) {
        whereCondition.id = trimmed;
      } else {
        // Если search — невалидный UUID, возвращаем пустой результат
        return {
          items: [],
          totalItems: 0,
          totalPages: 0,
          pageNumber: page,
          limit,
        };
      }
    }

    // 📅 Фильтр по диапазону дат (включая границы)
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) {
        whereCondition.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // 👈 чтобы включать всю дату
        whereCondition.createdAt[Op.lte] = end;
      }
    }

    // ✅ Фильтр по статусу
    if (status && status.length > 0) {
      whereCondition.orderStatus = { [Op.in]: status };
    }

    if (userId) {
      whereCondition.userId = userId;
    }

    const { rows: orders, count: totalItems } = await this.orderModel.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [[sort, order]],
      distinct: true,
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: FileModel, as: 'images' }, { model: Category }],
            },
          ],
        },
        {
          model: User,
          attributes: ['id', 'fullName', 'phoneNumber', 'email'],
        },
      ],
    });

    return {
      items: orders,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      pageNumber: page,
      limit,
    };
  }

  async findOneOrder(id: number): Promise<Order> {
    const order = await this.orderModel.findOne({
      where: { id },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: FileModel, as: 'images' }, { model: Category }],
            },
          ],
        },
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    return order;
  }

  async updateOrderOrPaymentStatus({
    transactionId,
    orderStatus,
    paymentStatus,
  }: UpdatePaymentStatusDto): Promise<Order> {
    // Начинаем транзакцию
    const transaction = await this.orderModel.sequelize.transaction();

    try {
      // Поиск заказа по transactionId
      const order = await this.orderModel.findOne({
        where: { transactionId },
        transaction, // Используем транзакцию для консистентности данных
      });

      if (!order) {
        throw new NotFoundException(`Заказ с transactionId ${transactionId} не найден.`);
      }

      if (!orderStatus) {
        throw new BadRequestException('Статус заказа обязателен.');
      }

      // Обновляем статус заказа и платежа
      order.orderStatus = orderStatus;
      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
      }
      await order.save({ transaction });

      // Фиксируем изменения в БД
      await transaction.commit();

      // Отправка уведомлений после успешного обновления
      await this.notificationService.sendNotificationToAdmin<Order>({
        type: WS_MESSAGE_TYPE.ORDER_STATUS,
        payload: order,
      });

      await this.notificationService.sendUserNotification<Order>({
        recipientUserIds: [order.userId],
        message: {
          type: WS_MESSAGE_TYPE.ORDER_STATUS,
          payload: order,
        },
      });

      return order; // Возвращаем обновленный объект заказа
    } catch (error) {
      // Откатываем транзакцию при ошибке
      await transaction.rollback();
      throw error;
    }
  }
}
function validateUUID(trimmed: string) {
  throw new Error('Function not implemented.');
}

