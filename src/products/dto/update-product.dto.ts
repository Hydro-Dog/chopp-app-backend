import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, IsArray, IsInt, IsBoolean, IsUUID } from 'class-validator';
import { PRODUCT_STATE } from 'src/shared/enums';

export class UpdateProductDto {
  @ApiProperty({
    description: 'ID of the product to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Product title',
    example: 'Car',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Product description',
    example: 'So fast',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Product state',
    example: 'hidden',
  })
  @IsString()
  state: PRODUCT_STATE;

  @ApiProperty({
    description: 'Product category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'IDs of product images',
    type: 'array',
    items: {
      type: 'number',
      example: 'uuid',
    },
  })
  @IsArray()
  imageIds: string[];

  @ApiProperty({
    description: 'Product images',
    type: 'array',
    items: {
      type: 'string',
      example: 'uuid1',
    },
  })
  @ApiProperty({
    description: 'remainingOldImages:FilesModel[] array stringified FilesModel',
    example: 'FilesModel',
  })
  @IsArray()
  remainingOldImages: string[];
}
