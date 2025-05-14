import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from 'src/users/users.model';

@Table({ tableName: 'active_ws_sessions' })
export class ActiveSession extends Model<ActiveSession> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  sid: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  connectedAt: Date;
}
