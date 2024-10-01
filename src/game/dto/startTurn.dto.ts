import { IsNotEmpty, IsString } from 'class-validator';
export class StartTurnDto {
  @IsString()
  @IsNotEmpty()
  gameId: string

  @IsNotEmpty()
  @IsNotEmpty()
  teamName: string
}
