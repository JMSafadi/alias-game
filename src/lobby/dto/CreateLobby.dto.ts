import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLobbyDto {
  @ApiProperty({
    description: 'ID of the user creating the lobby.',
    example: 'user123',
  })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Number of players per team. Min: 2, Max: 5.',
    example: 3,
  })
  @IsInt()
  @Min(2, { message: 'The minimum number of players is 2.' })
  @Max(5, { message: 'The maximum number of players is 5.' })
  playersPerTeam: number;
}
