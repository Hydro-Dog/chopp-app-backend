import { Column, Model, Table, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import { ShoppingCart } from './shopping-cart.model';
import { Product } from 'src/products/product.model';
import { Order } from 'src/order/order.model';

@Table({ tableName: 'shopping_cart_items' })
export class ShoppingCartItem extends Model<ShoppingCartItem> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: true, // Разрешаем NULL
    onDelete: 'SET NULL', // Устанавливаем NULL при удалении продукта
  })
  productId: string | null;

  @BelongsTo(() => Product)
  product: Product;

  @ForeignKey(() => ShoppingCart)
  @Column({
    type: DataType.UUID,
  })
  shoppingCartId: string;

  @BelongsTo(() => ShoppingCart)
  shoppingCart: ShoppingCart;

  @ForeignKey(() => Order)
  @Column({ type: DataType.UUID })
  orderId: string;

  @BelongsTo(() => Order)
  order: Order;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  quantity: number;
}
