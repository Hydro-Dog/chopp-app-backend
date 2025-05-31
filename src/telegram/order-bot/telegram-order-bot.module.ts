import { Module } from '@nestjs/common';
import { TelegramOrderBotService } from './telegram-order-bot.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/users/users.model';

@Module({
  imports: [ConfigModule, SequelizeModule.forFeature([User])],
  providers: [TelegramOrderBotService],
  exports: [TelegramOrderBotService],
})
export class TelegramOrderBotModule {}
