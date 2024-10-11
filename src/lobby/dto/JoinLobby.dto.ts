import { IsNotEmpty, IsString } from 'class-validator';

export class JoinLobbyDto {
    @IsNotEmpty({ message: 'This fild is required.'})
    @IsString()
    userId: string;

    @IsNotEmpty({ message: 'This fild is required.'})
    @IsString()
    lobbyId: string;
}