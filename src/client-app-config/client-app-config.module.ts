import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientAppConfig } from './client-app-config.model';
import { ClientAppConfigController } from './client-app-config.controller';
import { ClientAppConfigService } from './client-app-config.service';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/websockets/notification/notification.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ClientAppConfig]),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => ProductsModule),
  ],
  controllers: [ClientAppConfigController],
  providers: [ClientAppConfigService],
  exports: [ClientAppConfigService],
})
export class ClientAppConfigModule {}
