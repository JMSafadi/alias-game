import { IsNotEmpty, IsString } from 'class-validator';

export class JoinLobbyDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    lobbyId: string;
}