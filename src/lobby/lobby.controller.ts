import { Body, Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { CreateLobbyDto } from './dto/CreateLobby.dto';
import { UpdateLobbyDto } from './dto/UpdateLobby.dto';
import { JoinLobbyDto } from './dto/JoinLobby.dto';
import { AssignTeamsDto } from './dto/AssignTeams.dto';

@Controller('lobby')
export class LobbyController {
    constructor(private lobbyService: LobbyService) { }

    //Route to fetch all lobbies.
    @Get()
    async getAllLobbies() {
        return this.lobbyService.getAllLobbies();
    }

    //Route to fetch a specific lobby by id.
    @Get(':id')
    async getLobbyById(@Param('id') id: string) {
        return this.lobbyService.getLobbyById(id);
    }

    //Route to create a new lobby.
    @Post('create')
    createLobby(@Body() createLobbyDto: CreateLobbyDto) {
        return this.lobbyService.createLobby(createLobbyDto);
    }

    //Route to update an existing lobby.
    @Put(':id')
    async updateLobby(@Param('id') id: string, @Body() updateLobbyDto: UpdateLobbyDto) {
        return this.lobbyService.updateLobby(id, updateLobbyDto);
    }

    //Route to delete a lobby by id.
    @Delete(':id')
    async deleteLobby(@Param('id') id: string) {
        return this.lobbyService.deleteLobbyById(id);
    }

    //Route to join an existing lobby.
    @Post('join')
    joinLobby(@Body() joinLobbyDto: JoinLobbyDto) {
        return this.lobbyService.joinLobby(joinLobbyDto);
    }

    //Route to assign players to each team.
    @Post('teams')
    assignTeams(@Body() assignTeamsDto: AssignTeamsDto) {
        return this.lobbyService.assignTeams(assignTeamsDto);
    }
}