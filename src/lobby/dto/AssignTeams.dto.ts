import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class Team {
  @IsNotEmpty()
  @IsString()
  teamName: string;

  @IsArray()
  @IsString({ each: true })
  players: string[];
}

export class AssignTeamsDto {
  @IsNotEmpty()
  @IsString()
  lobbyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Team)
  teams: Team[];

  @IsInt()
  @Min(5, { message: 'The minimum number of rounds is 5.' })
  @Max(10, { message: 'The maximum number of rounds is 10.' })
  rounds: number;

  @IsInt()
  @Min(30, { message: 'The minimum time per turn is 30 seconds.' })
  @Max(120, { message: 'The maximum time per turn is 120 seconds.' })
  timePerTurn: number;
}
