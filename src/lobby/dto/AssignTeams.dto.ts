import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class Team {
  @ApiProperty({
    description: 'Name of the team.',
    example: 'Team A',
  })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  teamName: string;

  @ApiProperty({
    description: 'List of player names in the team.',
    example: ['player1', 'player2'],
  })
  @IsArray()
  @IsString({ each: true })
  players: string[];
}

export class AssignTeamsDto {
  @ApiProperty({
    description: 'ID of the lobby to assign teams to.',
    example: 'lobby123',
  })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  lobbyId: string;

  @ApiProperty({
    description: 'List of teams to assign to the lobby.',
    type: [Team],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Team)
  teams: Team[];
}
