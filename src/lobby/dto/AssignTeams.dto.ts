import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
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
}