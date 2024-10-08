import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateLobbyDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsInt()
  @Min(2, { message: 'The minimum number of players is 2.' })
  @Max(5, { message: 'The maximum number of players is 5.' })
  playersPerTeam: number;
}
