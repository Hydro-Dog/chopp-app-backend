import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Subscription } from './subscription.model';
import { NotificationService } from 'src/websockets/notification/notification.service';
import { SUBSCRIPTION_STATUS } from './constants';


@Injectable()
export class YooKassaWebhookService {
  constructor(
    @InjectModel(Subscription) private readonly subscriptionModel: typeof Subscription,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Создание новой подписки.
   * @param data Данные подписки
   */
  async createSubscription(data: {
    transactionId: string;
    orderId: number;
    status?: string;
  }): Promise<Subscription> {
    return this.subscriptionModel.create(data);
  }

  /**
   * Обновление статуса подписки по ID транзакции.
   * @param transactionId ID транзакции
   * @param status Новый статус подписки
   */
  async updateSubscriptionStatus(transactionId: string, status: string): Promise<void> {
    const subscription = await this.subscriptionModel.findOne({ where: { transactionId } });

    if (!subscription) {
      throw new NotFoundException(`Подписка с ID транзакции ${transactionId} не найдена.`);
    }

    subscription.status = status;
    await subscription.save();
  }

  /**
   * Удаление подписки по ID транзакции.
   * @param transactionId ID транзакции
   */
  async removeSubscription(transactionId: string): Promise<void> {
    const subscription = await this.subscriptionModel.findOne({ where: { transactionId } });

    if (!subscription) {
      throw new NotFoundException(`Подписка с ID транзакции ${transactionId} не найдена.`);
    }

    await subscription.destroy();
  }

  /**
   * Получение всех активных подписок со статусом PENDING.
   */
  async getActiveSubscriptions(): Promise<Subscription[]> {
    return this.subscriptionModel.findAll({
      where: { status: SUBSCRIPTION_STATUS.PENDING },
    });
  }
}
