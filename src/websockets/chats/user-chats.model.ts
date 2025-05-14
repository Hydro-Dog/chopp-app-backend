import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from 'src/users/users.model';
import { Chat } from './chats.model';

@Table({ tableName: 'user_chats', createdAt: false, updatedAt: false })
export class UserChats extends Model<UserChats> {
  @ApiProperty({ example: 'uuid', description: 'primary key id' })
  @Column({
    type: DataType.UUID,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  userId: string;

  @ForeignKey(() => Chat)
  @Column({
    type: DataType.UUID,
  })
  chatId: string;
}
