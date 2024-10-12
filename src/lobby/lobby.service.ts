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
import { UpdateLobbyDto } from './dto/UpdateLobby.dto';
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
        lobbyName: lobbyObject.lobbyName,
        lobbyOwner: userMap.get(lobbyObject.ownerId.toString()),
        playersPerTeam: lobbyObject.playersPerTeam,
        maxPlayers: lobbyObject.maxPlayers,
        currentPlayers: lobbyObject.currentPlayers,
        players: lobbyObject.players.map((player) => ({
          username: userMap.get(player.userId.toString()),
        })),
      };
    });
  }
  async getLobbyById(lobbyId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(lobbyId)) {
      throw new BadRequestException(`Invalid lobby ID: ${lobbyId}.`);
    }

        // Use lean() to return a plain JavaScript object instead of a Mongoose document
        const lobby = await this.lobbyModel.findById(lobbyId).lean();
        if (!lobby) {
            throw new NotFoundException(`Lobby with ID ${lobbyId} not found.`);
        }

        const ownerId = lobby.ownerId;
        const playerIds = lobby.players.map(player => player.userId);

    const userIds = [ownerId, ...playerIds];
    const users = await this.userModel
      .find({ _id: { $in: userIds } }, 'username')
      .exec();

    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.username]),
    );

        return { // Filter and format the data to expose.
            lobbyOwner: userMap.get(ownerId.toString()),
            lobbyName: lobby.lobbyName,
            playersPerTeam: lobby.playersPerTeam,
            maxPlayers: lobby.maxPlayers,
            currentPlayers: lobby.currentPlayers,
            players: lobby.players.map(player => ({
                username: userMap.get(player.userId.toString()),
            })),
        };
    }

    async createLobby(createLobbyDto: CreateLobbyDto) {
        const ownerId = createLobbyDto.userId;

        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            throw new BadRequestException(`Invalid User ID: ${ownerId}.`);
        }

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

        const newLobby = await this.lobbyModel.create({
            ownerId: ownerId,
            lobbyName: `${user.username}'s Lobby`, //Set the owner of the lobby.
            playersPerTeam: playersPerTeam, //Set the number of players per team.
            maxPlayers: maxPlayers,
            currentPlayers: 1,  //The owner is already in the lobby.
            teamCount: 2, //Set the number of teams to 2.
            players: [{ userId: ownerId }], //Add owner to the players list.
        });

        const lobbyObject = newLobby.toObject();

    delete lobbyObject.ownerId; //Replace the ownerId with lobbyOwner (username).
    delete lobbyObject._id;
    delete lobbyObject.__v;
    delete lobbyObject.teamCount;

        return { //Filter and format the data to expose.
            lobbyOwner: user.username,
            ...lobbyObject,
            players: newLobby.players.map(player => ({
                username: user.username,
            })),
        };
    }

    async updateLobby(lobbyId: string, updateLobbyDto: UpdateLobbyDto): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(lobbyId)) {
            throw new BadRequestException(`Invalid lobby ID: ${lobbyId}.`);
        }

        const lobby = await this.lobbyModel.findById(lobbyId);
        if (!lobby) {
            throw new NotFoundException(`Lobby with ID ${lobbyId} not found.`);
        }

        if (updateLobbyDto.lobbyName) {
            const existingLobby = await this.lobbyModel.findOne({ lobbyName: updateLobbyDto.lobbyName });
            if (existingLobby && existingLobby._id.toString() !== lobby._id.toString()) {
                throw new BadRequestException(`Lobby name '${updateLobbyDto.lobbyName}' is already in use.`);
            }
            lobby.lobbyName = updateLobbyDto.lobbyName;
        }

        //Check if there are any changes in the data.
        const isLobbyNameSame = updateLobbyDto.lobbyName === lobby.lobbyName;
        const isPlayersPerTeamSame = updateLobbyDto.playersPerTeam === lobby.playersPerTeam;

        if (isLobbyNameSame && isPlayersPerTeamSame) {
            throw new BadRequestException("No changes detected. Lobby's information unchanged.");
        }

        //Ensure maxPlayers (playersPerTeam *2) is not set lower than the current number of players.
        if ((updateLobbyDto.playersPerTeam * 2) < lobby.currentPlayers) {
            throw new BadRequestException(`Cannot reduce players per team to ${updateLobbyDto.playersPerTeam} when there are ${lobby.currentPlayers} current players.`);
        }

        //Update lobby's infromation.
        if (updateLobbyDto.lobbyName) {
            lobby.lobbyName = updateLobbyDto.lobbyName;
        }
        if (updateLobbyDto.playersPerTeam) {
            lobby.playersPerTeam = updateLobbyDto.playersPerTeam;
            lobby.maxPlayers = updateLobbyDto.playersPerTeam * 2;
        }

        await lobby.save();

        return { message: `Lobby's information updated successfully.` };
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

    delete lobbyObject._id;
    delete lobbyObject.__v;
    delete lobbyObject.teamCount;


        return { //Filter and format the data to expose.
            lobbyID: savedLobby._id,
            lobbyOwner: userMap.get(ownerId.toString()),
            lobbyName: lobbyObject.lobbyName,
            playersPerTeam: lobbyObject.playersPerTeam,
            maxPlayers: lobbyObject.maxPlayers,
            currentPlayers: lobbyObject.currentPlayers,
            players: lobbyObject.players.map(player => ({
                username: userMap.get(player.userId.toString()),
            })),
        };
    }

  async assignTeams(assignTeamsDto: AssignTeamsDto): Promise<any> {
    //Check if the provided lobby ID is valid.
    if (!mongoose.Types.ObjectId.isValid(assignTeamsDto.lobbyId)) {
      throw new BadRequestException(
        `Invalid lobby ID: ${assignTeamsDto.lobbyId}.`,
      );
    }

    //Find the lobby by its ID.
    const lobby = await this.lobbyModel.findById(assignTeamsDto.lobbyId);
    if (!lobby) {
      throw new NotFoundException(
        `Lobby with ID ${assignTeamsDto.lobbyId} not found.`,
      );
    }

    //Extract all player IDs from the teams in assignTeamsDto.
    const allPlayers = assignTeamsDto.teams.flatMap((team) => team.players);

    //Get the IDs of all players currently in the lobby.
    const lobbyPlayerIds = lobby.players.map((player) => player.userId);

    //Check if there are any players in assignTeamsDto who are not in the lobby.
    const missingPlayers = allPlayers.filter(
      (playerId) => !lobbyPlayerIds.includes(playerId),
    );
    if (missingPlayers.length > 0) {
      throw new BadRequestException(
        'Invalid Team Assignment: Some players are not in the lobby.',
      );
    }

    //Check if the number of players in the teams matches the number of players in the lobby.
    if (allPlayers.length !== lobby.currentPlayers) {
      throw new BadRequestException(
        'Invalid Team Assignment: Incorrect number of players.',
      );
    }

        //Check if the current number of players matches maxPlayers.
        if (lobby.currentPlayers !== lobby.maxPlayers) {
            throw new BadRequestException(`Invalid Team Assignment: The current number of players '${lobby.currentPlayers}' does not match maxPlayers '${lobby.maxPlayers}'.`);
        }

        //Create a map to assign each player to their respective team.
        const playerTeamMap = new Map();
        assignTeamsDto.teams.forEach(team => {
            team.players.forEach(playerId => {
                playerTeamMap.set(playerId, team.teamName);
            });
        });

        //Assign each player in the lobby to their respective team based on the map.
        lobby.players = lobby.players.map(player => {
            return { ...player, team: playerTeamMap.get(player.userId) || '' };
        });

        //Query the usernames for all players in the teams.
        const users = await this.userModel.find({ _id: { $in: allPlayers } }, 'username').exec();

    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.username]),
    );

    const teamsWithUsernames = assignTeamsDto.teams.map((team) => ({
      teamName: team.teamName,
      players: team.players.map(
        (playerId) => userMap.get(playerId.toString()) || playerId,
      ), //Replace userId with username.
    }));

    await lobby.save();

        return { //Filter and format the data to expose.
            lobbyId: lobby._id,
            teams: teamsWithUsernames,  //Show usernames instead of usersID.
            message: "Teams assigned successfully. The game is about to start!"
        };
    }
}
