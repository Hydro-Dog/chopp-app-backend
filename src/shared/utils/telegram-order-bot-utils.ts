import type { Order } from 'src/order/order.model';
import { ORDER_STATUS_RU } from 'src/shared/enums/order-status';

export const formatOrderNotificationMessage = (data: Order) => {
  const addressParts = (data.address || '').split(';').map((part) => part.trim());
  const addressMap: Record<string, string> = {};
  addressParts.forEach((part) => {
    const [key, value] = part.split(':').map((s) => s.trim());
    if (key && value) {
      addressMap[key] = value;
    }
  });

  const addressLines = [
    addressMap['Улица'] ? `🏙️ Улица: ${addressMap['Улица']}` : '',
    addressMap['Дом'] ? `🏠 Дом: ${addressMap['Дом']}` : '',
    addressMap['Квартира'] ? `🚪 Квартира: ${addressMap['Квартира']}` : '',
    addressMap['Подъезд'] ? `🚪 Подъезд: ${addressMap['Подъезд']}` : '',
    addressMap['Этаж'] ? `⬆️ Этаж: ${addressMap['Этаж']}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const orderStatusRu = ORDER_STATUS_RU[data.orderStatus as keyof typeof ORDER_STATUS_RU] || data.orderStatus;

  return (
    `🛒 <b>Новый заказ!</b>\n\n` +
    `🆔 <b>id заказа:</b> ${data.id}\n` +
    `👤 <b>Имя покупателя:</b> ${data.name}\n` +
    `📞 <b>Телефон:</b> ${data.phoneNumber}\n` +
    `💰 <b>Сумма:</b> ${data.totalPrice} ₽\n` +
    (addressLines ? `\n📦 <b>Адрес доставки:</b>\n${addressLines}\n` : '') +
    `💬 <b>Комментарий:</b> ${data.comment ? data.comment : '—'}\n` +
    `💳 <b>Статус оплаты:</b> ${orderStatusRu}`
  );
};
