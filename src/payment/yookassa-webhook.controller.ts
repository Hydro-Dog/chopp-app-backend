import {
  Controller,
  Post,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { YooKassaWebhookService } from './yookassa-webhook.service';
import { OrderService } from 'src/order/order.service';
import { NotificationService } from 'src/websockets/notification/notification.service';
import { ORDER_STATUS, PAYMENT_STATUS, WS_MESSAGE_TYPE } from 'src/shared/enums';
import { isIpAllowed } from './guards/yookassa-ip-guard';

@Controller('yookassa/webhook')
export class YooKassaWebhookController {
  constructor(
    private readonly subscriptionService: YooKassaWebhookService,
    private readonly orderService: OrderService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Обработка вебхуков от ЮKassa.
   * @param payload Данные вебхука
   * @param req HTTP-запрос
   */
  @Post()
  async handleWebhook(
    @Body() payload: any,
    @Req() req: Request,
  ): Promise<{ status: string }> {
    const clientIp = this.extractClientIp(req);
    console.log('🏧 req.ip:', req.ip);
    console.log('🏧 x-forwarded-for:', req.headers['x-forwarded-for']);


    if (!isIpAllowed(clientIp)) {
      console.error(`❗️ handleWebhook: IP ${clientIp} не разрешён`, )
      throw new ForbiddenException(`IP ${clientIp} не разрешён`);
    }

    const { event, object } = payload;

    switch (event) {
      case 'payment.succeeded':
        await this.processPaymentSucceeded(object.id);
        break;

      case 'payment.canceled':
        await this.processPaymentCanceled(object.id);
        break;

      default:
        console.error(`Необработанное событие: ${event}`);
        await this.notificationService.sendNotificationToAdmin<string>({
          type: WS_MESSAGE_TYPE.ORDER_STATUS,
          payload: `Необработанное событие: ${event}`,
        });
    }

    return { status: 'ok' };
  }

  /** Получение IP клиента с учётом прокси и IPv6 */
  private extractClientIp(req: Request): string {
    // Express может прокидывать IP в заголовке X-Forwarded-For
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (typeof xForwardedFor === 'string') {
      return xForwardedFor.split(',')[0].trim();
    }

    // Fallback — IP соединения
    return req.ip.replace('::ffff:', ''); // Убираем IPv4-mapped IPv6
  }

  private async processPaymentSucceeded(transactionId: string): Promise<void> {
    await this.orderService.updateOrderPaymentStatus({
      transactionId,
      orderStatus: ORDER_STATUS.PAYMENT_SUCCEEDED,
      paymentStatus: PAYMENT_STATUS.SUCCEEDED,
    });

    await this.subscriptionService.updateSubscriptionStatus(transactionId, 'succeeded');
    await this.subscriptionService.removeSubscription(transactionId);
  }

  private async processPaymentCanceled(transactionId: string): Promise<void> {
    await this.orderService.updateOrderPaymentStatus({
      transactionId,
      orderStatus: ORDER_STATUS.PAYMENT_CANCELED,
      paymentStatus: PAYMENT_STATUS.CANCELED,
    });

    await this.subscriptionService.updateSubscriptionStatus(transactionId, 'canceled');
    await this.subscriptionService.removeSubscription(transactionId);
  }
}
