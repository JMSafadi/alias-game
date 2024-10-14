import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lobby } from '../schemas/Lobby.schema';
import { User } from '../schemas/User.schema';
import { CreateLobbyDto } from './dto/CreateLobby.dto';
import { JoinLobbyDto } from './dto/JoinLobby.dto';
import { AssignTeamsDto } from './dto/AssignTeams.dto';
import mongoose from 'mongoose';

@Injectable()
export class LobbyService {
  constructor(
    @InjectModel(Lobby.name) private lobbyModel: Model<Lobby>,
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  async getAllLobbies(): Promise<any[]> {
    const lobbies = await this.lobbyModel.find().exec();

    if (lobbies.length === 0) {
      throw new NotFoundException('No lobbies found, try creating your own!');
    }

    const ownerIds = lobbies.map((lobby) => lobby.ownerId); //Collect all unique ownerIds and playerIds from the lobbies.
    const playerIds = lobbies.flatMap((lobby) =>
      lobby.players.map((player) => player.userId),
    );
    const uniqueUserIds = [...new Set([...ownerIds, ...playerIds])];

    const users = await this.userModel
      .find({ _id: { $in: uniqueUserIds } }, 'username')
      .exec();

    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.username]),
    );

    return lobbies.map((lobby) => {
      const lobbyObject = lobby.toObject(); //Convert to plain JS object.

      return {
        //Filter and format the data to expose.
        lobbyID: lobbyObject._id,
        lobbyOwner: userMap.get(lobbyObject.ownerId.toString()),
        playersPerTeam: lobbyObject.playersPerTeam,
        maxPlayers: lobbyObject.maxPlayers,
        currentPlayers: lobbyObject.currentPlayers,
        players: lobbyObject.players.map((player) => ({
          username: userMap.get(player.userId.toString()),
          userId: player.userId,
        })),
      };
    });
  }

  async getLobbyById(lobbyId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(lobbyId)) {
      throw new BadRequestException(`Invalid lobby ID: ${lobbyId}.`);
    }

    const lobby = await this.lobbyModel.findById(lobbyId);
    if (!lobby) {
      throw new NotFoundException(`Lobby with ID ${lobbyId} not found.`);
    }

    const lobbyObject = lobby.toObject();
    const ownerId = lobbyObject.ownerId;
    const playerIds = lobbyObject.players.map((player) => player.userId);
    // 
    console.log('lobby object; ', lobbyObject);
    // 
    const userIds = [ownerId, ...playerIds];
    const users = await this.userModel
      .find({ _id: { $in: userIds } }, 'username')
      .exec();
    
    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.username]),
    );

    return {
      //Filter and format the data to expose.
      lobbyOwner: userMap.get(ownerId.toString()),
      playersPerTeam: lobbyObject.playersPerTeam,
      maxPlayers: lobbyObject.maxPlayers,
      currentPlayers: lobbyObject.currentPlayers,
      players: lobbyObject.players.map((player) => ({
        username: userMap.get(player.userId.toString()),
        userId: player.userId,
      })),
      teams: lobbyObject.teams,
    };
  }

  async createLobby(createLobbyDto: CreateLobbyDto): Promise<any> {
    const ownerId = createLobbyDto.userId;
    const user = await this.userModel.findById(ownerId);

    if (!user) {
      throw new NotFoundException(
        `User Not Found: User with ID ${createLobbyDto.userId} not found.`,
      );
    }

    const existingLobby = await this.lobbyModel.findOne({
      $or: [
        { ownerId: ownerId }, //Check if the user is the owner of any lobby.
        { 'players.userId': ownerId }, //Check if the user is a player in any lobby.
      ],
    });

    if (existingLobby) {
      throw new BadRequestException('User is already in another lobby.');
    }

    const playersPerTeam = createLobbyDto.playersPerTeam;
    const maxPlayers = playersPerTeam * 2; //Lobby's capacity.

    const newLobby = new this.lobbyModel({
      ownerId: ownerId, //Set the owner of the lobby.
      playersPerTeam: playersPerTeam, //Set the number of players per team.
      maxPlayers: maxPlayers,
      currentPlayers: 1, //The owner is already in the lobby.
      teamCount: 2, //Set the number of teams to 2.
      rounds: createLobbyDto.rounds,
      timePerTurn: createLobbyDto.timePerTurn,
      players: [{ userId: ownerId }], //Add owner to the players list.
    });

    const savedLobby = await newLobby.save();

    const lobbyObject = savedLobby.toObject();

    return {
      //Filter and format the data to expose.
      lobbyOwner: user.username,
      playersPerTeam: lobbyObject.playersPerTeam,
      maxPlayers: lobbyObject.maxPlayers,
      currentPlayers: lobbyObject.currentPlayers,
      players: savedLobby.players.map((player) => ({
        username: user.username,
        userId: player.userId,
      })),
    };
  }

  async joinLobby(joinLobbyDto: JoinLobbyDto): Promise<any> {
    //Validate lobbyId.
    if (!mongoose.Types.ObjectId.isValid(joinLobbyDto.lobbyId)) {
      throw new BadRequestException(
        `Invalid lobby ID: ${joinLobbyDto.lobbyId}`,
      );
    }

    //Find the lobby by ID.
    const lobby = await this.lobbyModel.findById(joinLobbyDto.lobbyId);
    if (!lobby) {
      throw new NotFoundException(
        `Lobby with ID ${joinLobbyDto.lobbyId} not found.`,
      );
    }

    //Check if the user is already in the lobby.
    const isUserAlreadyInLobby = lobby.players.some(
      (player) => player.userId === joinLobbyDto.userId,
    );
    if (isUserAlreadyInLobby) {
      throw new BadRequestException('User is already in the lobby.');
    }

    //Check if the user is already in another lobby.
    const existingLobby = await this.lobbyModel.findOne({
      'players.userId': joinLobbyDto.userId,
    });

    if (existingLobby) {
      throw new BadRequestException('User is already in another lobby.');
    }

    //Check if the lobby is full.
    if (lobby.currentPlayers >= lobby.maxPlayers) {
      throw new BadRequestException('Lobby Full.');
    }

    //Add the new player to the lobby.
    lobby.players.push({ userId: joinLobbyDto.userId });
    lobby.currentPlayers += 1;

    //Save the updated lobby.
    const savedLobby = await lobby.save();

    const lobbyObject = savedLobby.toObject(); //Convert the document to a plain JavaScript object for easy manipulation.

    const ownerId = lobbyObject.ownerId;
    const playerIds = lobbyObject.players.map((player) => player.userId);
    const userIds = [ownerId, ...playerIds];

    const users = await this.userModel
      .find({ _id: { $in: userIds } }, 'username')
      .exec();

    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.username]),
    );

    return {
      //Filter and format the data to expose.
      lobbyID: savedLobby._id,
      lobbyOwner: userMap.get(ownerId.toString()),
      playersPerTeam: lobbyObject.playersPerTeam,
      maxPlayers: lobbyObject.maxPlayers,
      currentPlayers: lobbyObject.currentPlayers,
      players: lobbyObject.players.map((player) => ({
        username: userMap.get(player.userId.toString()),
        userId: player.userId,
      })),
    };
  }

  async assignTeams(assignTeamsDto: AssignTeamsDto): Promise<{
    lobbyId: string;
    teams: { teamName: string; players: string[] }[];
    message: string;
  }> {
    // **1. Validate the provided lobby ID**
    if (!mongoose.Types.ObjectId.isValid(assignTeamsDto.lobbyId)) {
      throw new BadRequestException(
        `Invalid lobby ID: ${assignTeamsDto.lobbyId}.`,
      );
    }

    // **2. Find the lobby by its ID**
    const lobby = await this.lobbyModel.findById(assignTeamsDto.lobbyId);
    if (!lobby) {
      throw new NotFoundException(
        `Lobby with ID ${assignTeamsDto.lobbyId} not found.`,
      );
    }

    // **3. Extract all player IDs from the teams in assignTeamsDto**
    const allPlayers = assignTeamsDto.teams.flatMap((team) => team.players);

    // **4. Get the IDs of all players currently in the lobby**
    const lobbyPlayerIds = lobby.players.map((player) => player.userId);

    // **5. Check if any players in assignTeamsDto are not in the lobby**
    const missingPlayers = allPlayers.filter(
      (playerId) => !lobbyPlayerIds.includes(playerId),
    );
    if (missingPlayers.length > 0) {
      throw new BadRequestException(
        'Invalid Team Assignment: Some players are not in the lobby.',
      );
    }

    // **6. Check if the number of players in the teams matches the number in the lobby**
    if (allPlayers.length !== lobby.currentPlayers) {
      throw new BadRequestException(
        'Invalid Team Assignment: Incorrect number of players.',
      );
    }

    // **7. Assign players to their respective teams**
    const playerTeamMap = new Map();
    assignTeamsDto.teams.forEach((team) => {
      team.players.forEach((playerId) => {
        playerTeamMap.set(playerId, team.teamName);
      });
    });

    lobby.players = lobby.players.map((player) => {
      return { ...player, team: playerTeamMap.get(player.userId) || '' };
    });

    // **8. Update rounds and timePerTurn**
    // lobby.rounds = assignTeamsDto.rounds;
    // lobby.timePerTurn = assignTeamsDto.timePerTurn;

    // **9. Save the teams in the lobby**
    lobby.teams = assignTeamsDto.teams.map((team) => ({
      teamName: team.teamName,
      players: team.players,
    }));

    // **10. Fetch usernames for all players in the teams**
    const users = await this.userModel
      .find({ _id: { $in: allPlayers } }, 'username')
      .exec();

    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.username]),
    );

    const teamsWithUsernames = assignTeamsDto.teams.map((team) => ({
      teamName: team.teamName,
      players: team.players.map(
        (playerId) => userMap.get(playerId.toString()) || playerId,
      ),
    }));

    // **11. Save the updated lobby**
    console.log('lobby in lobby services:', lobby);
    await lobby.save();

    return {
      lobbyId: lobby._id.toString(),
      teams: teamsWithUsernames,
      message: 'Teams assigned successfully. The game is ready to start!',
    };
  }

  async deleteLobbyById(lobbyId: string): Promise<{ message: string }> {
    if (!mongoose.Types.ObjectId.isValid(lobbyId)) {
      throw new BadRequestException(`Invalid lobby ID: ${lobbyId}.`);
    }
    const lobby = await this.lobbyModel.findByIdAndDelete(lobbyId);
    if (!lobby) {
      throw new NotFoundException(`Lobby with ID ${lobbyId} not found.`);
    }
    return { message: `Lobby with ID ${lobbyId} deleted successfully.` };
  }
}