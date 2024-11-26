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
  @Min(2, { message: 'The minimum number of players per team is 2.' })
  @Max(5, { message: 'The maximum number of players per team is 5.' })
  playersPerTeam: number;

  @ApiProperty({
    description: 'Number of rounds for the game. Min: 5, Max: 10.',
    example: 5,
  })
  @IsInt()
  @Min(5, { message: 'The minimum number of rounds is 5.' })
  @Max(10, { message: 'The maximum number of rounds is 10.' })
  rounds: number;

  @ApiProperty({
    description: 'Time per turn in seconds. Min: 30, Max: 120.',
    example: 60,
  })
  @IsInt()
  @Min(30, { message: 'The minimum time per turn is 30 seconds.' })
  @Max(120, { message: 'The maximum time per turn is 120 seconds.' })
  timePerTurn: number;
}
