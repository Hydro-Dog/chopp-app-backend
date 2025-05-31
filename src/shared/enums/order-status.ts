export enum ORDER_STATUS {
  AWAITING_PAYMENT = 'awaitingPayment',
  PENDING = 'pending',
  PAYMENT_SUCCEEDED = 'paymentSucceeded',
  PAYMENT_CANCELED = 'paymentCanceled',
  IN_PROGRESS = 'inProgress',
  IN_DELIVERY_PROCESS = 'inDeliveryProcess',
  DELIVERED = 'delivered',
  REFUNDED = 'refunded',
}

export enum ORDER_STATUS_RU {
  awaitingPayment = 'Ожидает оплаты',
  pending = 'В ожидании',
  paymentSucceeded = 'Оплата прошла успешно',
  paymentCanceled = 'Оплата отменена',
  inProgress = 'В обработке',
  inDeliveryProcess = 'В процессе доставки',
  delivered = 'Доставлен',
  refunded = 'Возврат средств',
}
