import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/users.model';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/roles.model';
import { UserRoles } from './roles/user-roles.model';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ClientAppConfigModule } from './client-app-config/client-app-config.module';
import { ProductsModule } from './products/products.module';
import { FilesModule } from './files/files.module';
import { Category } from './categories/category.model';
import { Product } from './products/product.model';
import { ClientAppConfig } from './client-app-config/client-app-config.model';
import { FileModel } from './files/file.model';
import { ProductFile } from './products/product-file.model';
import { WebsocketsModule } from './websockets/websockets.module';
import { Chat } from './websockets/chats/chats.model';
import { UserChats } from './websockets/chats/user-chats.model';
import { ShoppingCartModule } from './shopping-cart/shopping-cart.module';
import { ShoppingCart } from './shopping-cart/shopping-cart.model';
import { ShoppingCartItem } from './shopping-cart/shopping-cart-item.model';
import { ChatMessages } from './websockets/chats/chat-messages.model';
import { Message } from './websockets/chats/messages.model';
import { ChatsModule } from './websockets/chats/chats.module';
import { MessagesModule } from './websockets/chats/messages.module';
import { OrderModule } from './order/order.module';
import { Order } from './order/order.model';
import { PaymentsModule } from './payment/payments.module';
import { OrderItem } from './order/order-item.model';
import { Subscription } from './payment/subscription.model';
import { AnalyticsModule } from './analytics/analytics.module';
import { OrderStats } from './order/order-stats.model';
import { ScheduleModule } from '@nestjs/schedule';
import { FileCleanupModule } from './file-cleanup/file-cleanup.module';
import { SubmitLoginModule } from './submit-login/submit-login.module';
import { TelegramModule } from './telegram/telegram.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      ttl: 300, // 5 минут
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'client'),
    // }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      logging: (sql, timing) => {
        const short = sql.split('\n')[0]; // Обрезаем длинные SQL
        console.log(`[DB] ${new Date().toISOString()} | ${short}${timing ? ` (${timing}ms)` : ''}`);
      },
      // benchmark: true, // Показывает время выполнения
      // logging: false, // Отключить в продакшне для повышения производительности
      models: [
        User,
        Role,
        Chat,
        Message,
        UserRoles,
        UserChats,
        ChatMessages,
        Category,
        Product,
        ClientAppConfig,
        FileModel,
        ProductFile,
        ShoppingCart,
        ShoppingCartItem,
        Order,
        OrderItem,
        Subscription,
        OrderStats,
      ],
      synchronize: isDev,
      // logging: !isProd,
      autoLoadModels: true,
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    ChatsModule,
    MessagesModule,
    WebsocketsModule,
    CategoriesModule,
    ClientAppConfigModule,
    ProductsModule,
    FilesModule,
    ShoppingCartModule,
    OrderModule,
    PaymentsModule,
    AnalyticsModule,
    FileCleanupModule,
    ScheduleModule.forRoot(),
    TelegramModule,
    SubmitLoginModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
