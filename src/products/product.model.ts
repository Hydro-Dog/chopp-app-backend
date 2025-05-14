import { Column, Model, Table, DataType, BelongsTo, ForeignKey, HasMany, BelongsToMany } from 'sequelize-typescript';
import { Category } from 'src/categories/category.model';
import { FileModel } from 'src/files/file.model';
import { ProductFile } from './product-file.model';
import { ShoppingCartItem } from 'src/shopping-cart/shopping-cart-item.model';
import { PRODUCT_STATE } from 'src/shared/enums';

@Table({ tableName: 'products' })
export class Product extends Model<Product> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  state: PRODUCT_STATE;

  @BelongsTo(() => Category)
  category: Category;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
  })
  categoryId: string;

  @BelongsToMany(() => FileModel, () => ProductFile)
  images: FileModel[];

  @Column({ type: DataType.ARRAY(DataType.UUID) })
  imagesOrder: FileModel['id'][];

  @HasMany(() => ShoppingCartItem)
  items: ShoppingCartItem[];
}
