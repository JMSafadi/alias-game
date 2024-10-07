import { IsNotEmpty, IsString } from 'class-validator';
export class GuessWordDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  teamName: string;

  @IsString()
  @IsNotEmpty()
  guessWord: string;
}
