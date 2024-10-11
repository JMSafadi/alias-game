import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Team {
    @IsNotEmpty({ message: 'This fild is required.'})
    @IsString()
    teamName: string;

  @IsArray()
  @IsString({ each: true })
  players: string[];
}

export class AssignTeamsDto {
    @IsNotEmpty({ message: 'This fild is required.'})
    @IsString()
    lobbyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Team)
  teams: Team[];
}
