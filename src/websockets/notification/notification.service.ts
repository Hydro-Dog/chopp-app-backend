import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from 'src/roles/roles.model';
import { User } from 'src/users/users.model';
import { WsMessage } from 'src/shared/types';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  /**
   * Отправка уведомления пользователям.
   * @param recipientUserIds Список ID получателей
   * @param message Сообщение
   */
  async sendUserNotification<T>({ recipientUserIds, message }: { recipientUserIds: string[]; message: WsMessage<T> }) {
    await this.notificationGateway.sendNotificationToClients<T>(recipientUserIds, message);
  }

  /**
   * Отправка уведомления всем администраторам.
   * TODO: Можно оптимизировать кэшированием.
   */
  async sendNotificationToAdmin<T>(message: WsMessage<T>) {
    const admins = await this.userModel.findAll({
      include: [{ model: Role, where: { value: 'ADMIN' } }],
    });

    const adminIds = admins.map((admin) => admin.id);
    await this.notificationGateway.sendNotificationToClients<T>(adminIds, message);
  }

  /**
   * Отправка широковещательного уведомления всем пользователям, кроме админов.
   */
  async sendBroadcastNotification<T>(message: WsMessage<T>) {
    const allUsers = await this.userModel.findAll({ attributes: ['id'] });

    const admins = await this.userModel.findAll({
      include: [{ model: Role, where: { value: 'ADMIN' } }],
      attributes: ['id'],
    });

    const adminIds = new Set(admins.map((admin) => admin.id));

    const userIds = allUsers.map((user) => user.id).filter((id) => !adminIds.has(id));

    await this.notificationGateway.sendNotificationToClients<T>(userIds, message);
  }
}
