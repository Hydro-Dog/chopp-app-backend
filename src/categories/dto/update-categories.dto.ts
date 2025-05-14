import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, IsUUID } from 'class-validator';

export class UpdateCategoriesDto {
  @ApiProperty({
    description: 'ID of the category to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'New title of the category',
    example: 'Updated Category Title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'New order of the category in the list',
    example: 2,
  })
  @IsInt()
  @Min(0)
  order: number;
}
