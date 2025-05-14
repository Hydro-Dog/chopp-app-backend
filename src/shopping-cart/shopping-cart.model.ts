import { Model, Table, Column, DataType, BelongsToMany, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from 'src/users/users.model';
import { ShoppingCartItem } from './shopping-cart-item.model';

@Table({ tableName: 'shopping_carts' })
export class ShoppingCart extends Model<ShoppingCart> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => ShoppingCartItem)
  items: ShoppingCartItem[];

  @Column({ type: DataType.FLOAT })
  totalPrice: number;

  @Column({ type: DataType.FLOAT })
  quantity: number;
}
