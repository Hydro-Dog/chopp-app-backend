import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsUUID } from 'class-validator';

export class AddProductToCartDto {
  @ApiProperty({
    description: 'ID of the product to add to the cart',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product to add',
    example: 2,
    type: Number,
    minimum: 1,
  })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
