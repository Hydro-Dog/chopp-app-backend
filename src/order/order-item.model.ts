import { Column, Model, Table, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import { Order } from './order.model';
import { Product } from 'src/products/product.model';

@Table({ tableName: 'order_items' })
export class OrderItem extends Model<OrderItem> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Order)
  @Column({ type: DataType.UUID })
  orderId: string;

  @BelongsTo(() => Order)
  order: Order;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: true, // Разрешаем NULL
    onDelete: 'SET NULL', // Устанавливаем NULL при удалении продукта
  })
  productId: string | null;

  @BelongsTo(() => Product)
  product: Product;

  @Column({ type: DataType.INTEGER })
  quantity: number;

  @Column({ type: DataType.FLOAT })
  price: number;
}
