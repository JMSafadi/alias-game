import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT token for the user',
    type: String,
  })
  token: string;

  @ApiProperty({
    description: 'Welcome message for the user',
    type: String,
  })
  message: string;
}
