import { Column, Model, Table, DataType, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { ProductFile } from 'src/products/product-file.model';
import { Product } from 'src/products/product.model';

@Table({ tableName: 'files' })
export class FileModel extends Model<FileModel> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  hash: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  path: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  originalName: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  size: number;

  @BelongsToMany(() => Product, () => ProductFile)
  products: Product[];
}
