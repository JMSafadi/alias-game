import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateLobbyDto {
    @IsOptional()
    @IsString()
    lobbyName?: string;

    @IsOptional()
    @IsInt()
    @Min(2, { message: 'The minimum number of players is 2.' })
    @Max(5, { message: 'The maximum number of players is 5.' })
    playersPerTeam?: number;

    @IsOptional()
    @IsInt()
    maxPlayers?: number;
}