import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateClientAppConfigDto } from './dto/create-client-app-config.dto';
import { ClientAppConfig } from './client-app-config.model';
import { NotificationService } from 'src/websockets/notification/notification.service';
import { PRODUCT_STATE, WS_MESSAGE_TYPE } from 'src/shared/enums';
import { ProductService } from 'src/products/products.service';

@Injectable()
export class ClientAppConfigService implements OnModuleInit {
  private readonly logger = new Logger(ClientAppConfigService.name);
  private readonly DEFAULT_CONFIG_ID = process.env.DEFAULT_CONFIG_ID;

  constructor(
    @InjectModel(ClientAppConfig)
    private clientAppModel: typeof ClientAppConfig,
    private readonly notificationService: NotificationService,
    private readonly productService: ProductService,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'development') return;

    const existingConfig = await this.clientAppModel.findByPk(this.DEFAULT_CONFIG_ID);
    if (!existingConfig) {
      await this.clientAppModel.create({ id: this.DEFAULT_CONFIG_ID, freeDeliveryIncluded: false });

      this.logger.log('🚀 Создан пустой CLEAN APP конфиг');
    }
  }

  async createOrUpdateConfig(dto: CreateClientAppConfigDto): Promise<ClientAppConfig> {
    const config = await this.clientAppModel.findByPk(this.DEFAULT_CONFIG_ID);

    if (config) {
      // 💬 Если передано поле disabled — шлём WS-сообщение
      if (typeof dto.disabled === 'boolean') {
        await this.notificationService.sendBroadcastNotification({
          type: WS_MESSAGE_TYPE.CLIENT_APP_CONFIG_STATUS,
          payload: {
            disabled: dto.disabled,
          },
        });
      }

      // 🔄 Если передана цена доставки — обновляем продукт "Доставка"
      if (dto.averageDeliveryCost !== undefined) {
        const deliveryProduct = await this.productService['productRepository'].findByPk(
          process.env.DELIVERY_PRODUCT_ID,
        );
        if (deliveryProduct) {
          await deliveryProduct.update({ price: dto.averageDeliveryCost });
        } else {
          await this.productService['productRepository'].create({
            id: process.env.DELIVERY_PRODUCT_ID,
            title: 'Доставка',
            description: 'Услуга доставки заказа',
            price: dto.averageDeliveryCost,
            state: PRODUCT_STATE.HIDDEN,
            imagesOrder: [],
          });
        }
      }

      return config.update(dto);
    } else {
      // Если конфиг отсутствует — создаём с указанным id
      return this.clientAppModel.create({ ...dto });
    }
  }

  async getConfig(): Promise<ClientAppConfig> {
    return this.clientAppModel.findByPk(this.DEFAULT_CONFIG_ID);
  }
}
