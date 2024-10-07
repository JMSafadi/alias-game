import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class TeamsDto {
  @IsString()
  @IsNotEmpty()
  teamName: string;

  @IsArray()
  @IsNotEmpty()
  players: string[];
}

export class StartGameDto {
  @IsString()
  lobbyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamsDto)
  @ArrayMinSize(2)
  @IsNotEmpty()
  teamsInfo: TeamsDto[];

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
