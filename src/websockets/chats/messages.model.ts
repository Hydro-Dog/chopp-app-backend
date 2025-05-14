import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from 'src/users/users.model';
import { Chat } from './chats.model';
import { ApiProperty } from '@nestjs/swagger';

@Table({ tableName: 'messages' })
export class Message extends Model {
  @Column({
    type: DataType.UUID,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty({ example: 'Hello! How are you?', description: 'Text of the message' })
  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @ApiProperty({ example: '[1, 2, 3]', description: 'Array of user IDs who read the message' })
  @Column({ type: DataType.ARRAY(DataType.UUID), allowNull: false, defaultValue: [] })
  wasReadBy: string[];

  @ForeignKey(() => User)
  @Column({ allowNull: true, type: DataType.UUID })
  senderId: string;

  @ForeignKey(() => Chat)
  @Column({ allowNull: true, type: DataType.UUID })
  @Column
  chatId: string;
}
