import { IsNotEmpty, IsString } from 'class-validator';

export class JoinLobbyDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  lobbyId: string;
}
