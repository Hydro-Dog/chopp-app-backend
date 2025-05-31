import { Module } from '@nestjs/common';
import { TelegramUsersBotService } from './telegram-user-bot.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { forwardRef } from '@nestjs/common';
import { TelegramOrderBotModule } from '../order-bot/telegram-order-bot.module';

@Module({
  imports: [HttpModule, ConfigModule, forwardRef(() => UsersModule), TelegramOrderBotModule],
  providers: [TelegramUsersBotService],
  exports: [TelegramUsersBotService],
})
export class TelegramUsersBotModule {}
