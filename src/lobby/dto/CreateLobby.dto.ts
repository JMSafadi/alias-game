import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateLobbyDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsInt()
    @Min(2)
    maxPlayers: number;

    @IsInt()
    @Min(2)
    teamCount: number;
}