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
  @IsNotEmpty({
    each: true,
    message: 'Each team must have at least one player.',
  })
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

  // @IsInt()
  // @Min(5, { message: 'The minimum number of rounds is 5.' })
  // @Max(10, { message: 'The maximum number of rounds is 10.' })
  // rounds: number;

  // @IsInt()
  // @Min(30, { message: 'The minimum time per turn is 30 seconds.' })
  // @Max(120, { message: 'The maximum time per turn is 120 seconds.' })
  // timePerTurn: number;
}
