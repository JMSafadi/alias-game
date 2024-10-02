import { IsNotEmpty, IsString } from "class-validator";

export class TeamGuessDto {
  @IsString()
  @IsNotEmpty()
  gameId: string

  @IsString()
  @IsNotEmpty()
  teamName: string

  @IsString()
  @IsNotEmpty()
  guess: string
}