import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { Order } from 'src/order/order.model';
import { formatOrderNotificationMessage } from 'src/shared/utils/telegram-order-bot-utils';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/users.model';
import { Role } from 'src/roles/roles.model';
import { formatPhoneNumber } from 'src/shared/utils/phone-format.utils';
import { sharePhoneButton, appButton } from '../keyboards/order-bot-keyboards';

@Injectable()
export class TelegramOrderBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramOrderBotService.name);
  private readonly bot: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {
    this.bot = new Telegraf(this.configService.get<string>('TELEGRAM_ORDER_BOT_TOKEN'));
  }
  onModuleInit() {
    this.bot.start((ctx) => {
      this.logger.log(`User ${ctx.from?.id} (${ctx.from?.username ?? 'no username'}) triggered /start`);
      ctx.reply(
        '👋 Добро пожаловать в Chopp order bot!\n\n' +
          'Пожалуйста, поделитесь своим номером телефона для проверки прав администратора.',
        {
          reply_markup: {
            keyboard: [sharePhoneButton],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    });

    this.bot.on('contact', async (ctx) => {
      const phone = ctx.message.contact.phone_number;
      const formattedPhone = formatPhoneNumber(phone);
      this.logger.log(
        `Received contact: phone=${formattedPhone}, from user=${ctx.from?.id} (${ctx.from?.username ?? 'no username'})`,
      );

      await ctx.reply(
        '✅ Спасибо! Ваш номер успешно получен и отправлен на проверку.\n\n' +
          '⏳ Ожидайте подтверждения прав администратора.',
        {
          reply_markup: {
            remove_keyboard: true,
          },
        },
      );

      const admin = await this.userModel.findOne({
        include: [{ model: Role, where: { value: 'ADMIN' } }],
        where: { phoneNumber: formattedPhone },
      });

      if (admin) {
        this.logger.log(
          `Admin found for phone=${formattedPhone}, userId=${admin.id}. Saving telegramUserId=${ctx.message.chat.id}`,
        );
        admin.telegramUserId = ctx.message.chat.id.toString();
        await admin.save();
        ctx.reply(
          '👋 Добро пожаловать в Chopp order bot!\n\n' +
            'Этот бот создан для продавцов и магазинов. 🛒\n' +
            'Здесь вы будете получать уведомления о новых покупках ваших товаров.\n\n' +
            '✅ Вы успешно подтверждены как администратор!\n' +
            'Оставайтесь на связи, чтобы не пропустить ни одной продажи! 🚀',
          {
            reply_markup: {
              inline_keyboard: [appButton],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          },
        );
      } else {
        this.logger.warn(`No admin found for phone=${formattedPhone}`);
        ctx.reply(
          '❌ К сожалению, ваш номер не найден среди администраторов.\n\n' +
            '🔄 Попробуйте позже или обратитесь к поддержке, если считаете это ошибкой.',
          {
            reply_markup: {
              keyboard: [sharePhoneButton],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          },
        );
      }
    });

    this.bot.launch();
    this.logger.log('Telegram order bot is running');
  }

  async sendMessageSeller(order: Order) {
    const data = order.dataValues;

    const message = formatOrderNotificationMessage(data);

    const admins = (await this.userModel.findAll({
      include: [{ model: Role, where: { value: 'ADMIN' } }],
    })) as User[];

    const adminChatIds = admins.map((admin) => admin.telegramUserId).filter(Boolean);

    adminChatIds.forEach((chatId) => {
      this.logger.log(`Sending order notification to admin ${chatId}`);
      this.bot.telegram
        .sendMessage(chatId, message, {
          parse_mode: 'HTML',
        })
        .catch((err) => {
          this.logger.error(`Failed to send message to admin ${chatId}: ${err.message}`);
        });
    });
  }
}
