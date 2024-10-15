import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TurnStartedDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNumber()
  @IsNotEmpty()
  round: number;

  @IsNumber()
  @IsNotEmpty()
  turn: number;

  @IsNumber()
  @IsNotEmpty()
  time: number;

  @IsString()
  @IsNotEmpty()
  wordToGuess: string;

  @IsString()
  @IsNotEmpty()
  teamName: string;

  @IsString()
  @IsNotEmpty()
  describer: string;

  constructor(init?: Partial<TurnStartedDto>) {
    Object.assign(this, init);
  }
}
