import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lobby } from 'src/schemas/Lobby.schema';
import { CreateLobbyDto } from './dto/CreateLobby.dto';
import { JoinLobbyDto } from './dto/JoinLobby.dto';
import { AssignTeamsDto } from './dto/AssignTeams.dto';

@Injectable()
export class LobbyService {
    constructor(@InjectModel(Lobby.name) private lobbyModel: Model<Lobby>) { }

    async getAllLobbies(): Promise<Lobby[]> {
        return this.lobbyModel.find().exec();
    }

    async getLobbyById(lobbyId: string): Promise<Lobby> {
        const lobby = await this.lobbyModel.findById(lobbyId).exec();
        if (!lobby) {
            throw new NotFoundException(`Lobby with ID ${lobbyId} not found`);
        }
        return lobby;
    }

    async createLobby(createLobbyDto: CreateLobbyDto) {
        const newLobby = new this.lobbyModel({
            owner: createLobbyDto.username,
            maxPlayers: createLobbyDto.maxPlayers,
            teamCount: createLobbyDto.teamCount,
        });
        return newLobby.save();
    }

    async joinLobby(joinLobbyDto: JoinLobbyDto) {
        const lobby = await this.lobbyModel.findById(joinLobbyDto.lobbyId);
        if (!lobby) {
            throw new Error('Lobby Not Found');
        }

        if (lobby.currentPlayers >= lobby.maxPlayers) {
            throw new Error('Lobby Full');
        }

        lobby.players.push({ username: joinLobbyDto.username });
        lobby.currentPlayers += 1;

        return lobby.save();
    }

    async assignTeams(assignTeamsDto: AssignTeamsDto) {
        const lobby = await this.lobbyModel.findById(assignTeamsDto.lobbyId);
        if (!lobby) {
            throw new Error('Lobby Not Found');
        }

        // Check if all players are present
        const allPlayers = assignTeamsDto.teams.flatMap(team => team.players);
        if (allPlayers.length !== lobby.currentPlayers) {
            throw new Error('Invalid Team Assignment');
        }

        // Assign players to teams
        lobby.players = lobby.players.map(player => {
            const team = assignTeamsDto.teams.find(t => t.players.includes(player.username));
            return { ...player, team: team ? team.teamName : '' };
        });

        return lobby.save();
    }
}