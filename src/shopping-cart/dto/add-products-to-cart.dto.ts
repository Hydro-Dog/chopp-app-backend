import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { AddProductToCartDto } from './add-product-to-cart.dto';

export class AddProductsToCartDto {
  @ApiProperty({
    type: [AddProductToCartDto],
    description: 'Array of products to add to the cart',
    isArray: true,
    example: [{ productId: 'uuid1', quantity: 2 }, { productId: 'uuid2', quantity: 3 }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddProductToCartDto)
  items: AddProductToCartDto[];
}
