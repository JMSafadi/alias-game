import { Body, Controller, Get, Post, Delete, Param, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LobbyService } from './lobby.service';
import { CreateLobbyDto } from './dto/CreateLobby.dto';
import { UpdateLobbyDto } from './dto/UpdateLobby.dto';
import { JoinLobbyDto } from './dto/JoinLobby.dto';
import { AssignTeamsDto } from './dto/AssignTeams.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controller responsible for managing lobbies.
 */
@ApiTags('Lobby')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('lobby')
export class LobbyController {
  constructor(private lobbyService: LobbyService) { }

  /**
   * Route to fetch all lobbies.
   */
  @ApiOperation({ summary: 'Get all lobbies' })
  @ApiResponse({
    status: 200,
    description: 'List of all lobbies retrieved successfully.',
  })
  @Get()
  async getAllLobbies() {
    return this.lobbyService.getAllLobbies();
  }
  //Route to update an existing lobby.
  @Put(':id')
  async updateLobby(@Param('id') id: string, @Body() updateLobbyDto: UpdateLobbyDto) {
      return this.lobbyService.updateLobby(id, updateLobbyDto);
  }

  /**
   * Route to fetch a specific lobby by ID.
   * @param id The lobby ID.
   */
  @ApiOperation({ summary: 'Get lobby by ID' })
  @ApiParam({ name: 'id', description: 'Lobby ID' })
  @ApiResponse({
    status: 200,
    description: 'Lobby retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Lobby not found.',
  })
  @Get(':id')
  async getLobbyById(@Param('id') id: string) {
    return this.lobbyService.getLobbyById(id);
  }

  /**
   * Route to create a new lobby.
   * @param createLobbyDto The data to create a new lobby.
   */
  @ApiOperation({ summary: 'Create a new lobby' })
  @ApiBody({ type: CreateLobbyDto })
  @ApiResponse({
    status: 201,
    description: 'Lobby created successfully.',
  })
  @Post('create')
  createLobby(@Body() createLobbyDto: CreateLobbyDto) {
    return this.lobbyService.createLobby(createLobbyDto);
  }

  /**
   * Route to join an existing lobby.
   * @param joinLobbyDto The data to join a lobby.
   */
  @ApiOperation({ summary: 'Join an existing lobby' })
  @ApiBody({ type: JoinLobbyDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the lobby.',
  })
  @Post('join')
  joinLobby(@Body() joinLobbyDto: JoinLobbyDto) {
    return this.lobbyService.joinLobby(joinLobbyDto);
  }

  /**
   * Route to assign players to each team in a lobby.
   * @param assignTeamsDto The data to assign teams.
   */
  @ApiOperation({ summary: 'Assign players to teams' })
  @ApiBody({ type: AssignTeamsDto })
  @ApiResponse({
    status: 200,
    description: 'Teams assigned successfully.',
  })
  @Post('teams')
  assignTeams(@Body() assignTeamsDto: AssignTeamsDto) {
    return this.lobbyService.assignTeams(assignTeamsDto);
  }

  /**
   * Route to delete a lobby by ID.
   * @param id The lobby ID.
   */
  @ApiOperation({ summary: 'Delete a lobby by ID' })
  @ApiParam({ name: 'id', description: 'Lobby ID' })
  @ApiResponse({
    status: 200,
    description: 'Lobby deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Lobby not found.',
  })
  @Delete(':id')
  async deleteLobby(@Param('id') id: string) {
    return this.lobbyService.deleteLobbyById(id);
  }
}
