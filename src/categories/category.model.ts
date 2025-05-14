import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Product } from 'src/products/product.model';

@Table({ tableName: 'categories' })
export class Category extends Model<Category> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  order: number;

  @HasMany(() => Product)
  products: Product[];
}
