import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Id of invitated user' })
  readonly userId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: "Id of chat's creator" })
  readonly ownerId: string;
}

