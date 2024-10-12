import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateLobbyDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsInt()
  @Min(2, { message: 'The minimum number of players per team is 2.' })
  @Max(5, { message: 'The maximum number of players per team is 5.' })
  playersPerTeam: number;

  @IsInt()
  @Min(5, { message: 'The minimum number of rounds is 5.' })
  @Max(10, { message: 'The maximum number of rounds is 10.' })
  rounds: number;

  @IsInt()
  @Min(30, { message: 'The minimum time per turn is 30 seconds.' })
  @Max(120, { message: 'The maximum time per turn is 120 seconds.' })
  timePerTurn: number;
}
