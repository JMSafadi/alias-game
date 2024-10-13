import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class StartGameDto {
  @IsNotEmpty({ message: 'Lobby ID is required.' })
  @IsString()
  lobbyId: string;

  // Update min
  @IsInt()
  @Min(5)
  @Max(10)
  rounds: number;

  @IsInt()
  @Min(30)
  @Max(120)
  timePerTurn: number;
}
