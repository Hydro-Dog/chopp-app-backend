import { Module } from '@nestjs/common';
import { SubmitLoginService } from './submit-login.service';
import { TelegramUsersBotModule } from '../telegram/user-bot/telegram-user-bot.module';

@Module({
  imports: [TelegramUsersBotModule],
  providers: [SubmitLoginService],
  exports: [SubmitLoginService],
})
export class SubmitLoginModule {}
