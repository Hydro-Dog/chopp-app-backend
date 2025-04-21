import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateClientAppConfigDto } from './dto/create-client-app-config.dto';
import { ClientAppConfig } from './client-app-config.model';
import { NotificationService } from 'src/websockets/notification/notification.service';
import { WS_MESSAGE_TYPE } from 'src/shared/enums';

@Injectable()
export class ClientAppConfigService implements OnModuleInit {
  private readonly logger = new Logger(ClientAppConfigService.name);

  constructor(
    @InjectModel(ClientAppConfig)
    private clientAppModel: typeof ClientAppConfig,
    private readonly notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'development') return;

    const existingConfig = await this.clientAppModel.findByPk(1);
    if (!existingConfig) {
      await this.clientAppModel.create({ id: 1, freeDeliveryIncluded: false });

      this.logger.log('🚀 Создан пустой CLEAN APP конфиг');
    }
  }

  async createOrUpdateConfig(
    dto: CreateClientAppConfigDto,
  ): Promise<ClientAppConfig> {
    const config = await this.clientAppModel.findByPk(1);
    if (config) {
      console.log('-------UPDATE', typeof dto.disabled, dto.disabled)
      if(typeof dto.disabled === 'boolean') {
        console.log('-------BROADCST')
        await this.notificationService.sendBroadcastNotification({
          type: WS_MESSAGE_TYPE.CLIENT_APP_CONFIG_STATUS,
          payload: {
            disabled: dto.disabled,
          },
        });
      }
      return config.update(dto);
    } else {
      // Поскольку у нас всегда должен быть id=1, создаем напрямую с этим id
      return this.clientAppModel.create({ ...dto, id: 1 });
    }
  }

  async getConfig(): Promise<ClientAppConfig> {
    return this.clientAppModel.findByPk(1);
  }
}
