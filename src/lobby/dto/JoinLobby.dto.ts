import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinLobbyDto {
  @ApiProperty({
    description: 'ID of the user joining the lobby.',
    example: 'user123',
  })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID of the lobby to join.',
    example: 'lobby456',
  })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  lobbyId: string;
}
