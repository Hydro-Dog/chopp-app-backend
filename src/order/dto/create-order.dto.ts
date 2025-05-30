import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDTO {
  @ApiProperty({
    example: 'http://example.com/returnUrl',
    description: 'URL для возврата пользователя после оплаты',
  })
  returnUrl: string;

  @ApiProperty({
    example: 'Москва, улица Красавчиков 1',
    description: 'Адрес',
  })
  address: string;

  @ApiProperty({
    example: 'Код подъезда 0000',
    description: 'Комментарий',
  })
  comment: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя получателя',
  })
  name: string;

  @ApiProperty({
    example: 'Телефон получателя',
    description: 'Телефон получателя',
  })
  phoneNumber: string;
}
