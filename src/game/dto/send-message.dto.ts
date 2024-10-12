import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  sender: string;

  @IsOptional()
  timestamp?: Date;

  @IsString()
  @IsNotEmpty()
  messageType: 'chat' | 'describe' | 'guess';

  @IsString()
  @IsOptional()
  senderTeamName?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsNotEmpty()
  gameId: string;

  // Dodanie właściwości lobbyId
  @IsString()
  @IsNotEmpty()
  lobbyId: string;
}
