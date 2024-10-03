import { IsNotEmpty, IsString } from 'class-validator';

export class StartTurnDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  teamName: string;
}
