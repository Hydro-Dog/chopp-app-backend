import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Chat } from './chats.model';
import { Message } from './messages.model';

@Table({ tableName: 'chat_messages', createdAt: false, updatedAt: false })
export class ChatMessages extends Model<ChatMessages> {
  @ApiProperty({ example: 'uuid', description: 'primary key id' })
  @Column({
    type: DataType.UUID,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Message)
  @Column({
    type: DataType.UUID,
  })
  messageId: string;

  @ForeignKey(() => Chat)
  @Column({
    type: DataType.UUID,
  })
  chatId: string;
}
