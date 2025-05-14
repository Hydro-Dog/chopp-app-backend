import { Column, Model, Table, DataType, ForeignKey } from 'sequelize-typescript';
import { FileModel } from 'src/files/file.model';
import { Product } from './product.model';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'product_files',
  createdAt: false,
  updatedAt: false,
})
export class ProductFile extends Model<ProductFile> {
  @ApiProperty({ example: 'uuid', description: 'primary key id' })
  @Column({
    type: DataType.UUID,
    unique: true,
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

  @ForeignKey(() => FileModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  fileId: string;
}
