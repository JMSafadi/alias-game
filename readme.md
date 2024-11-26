# Alias game

### Node.js-Based Game "Alias" with Chat and Word Checking

## Game description

Alias is a word-guessing game where players form teams. Each team takes turns where one member describes a word and others guess it. The game includes a chat for players to communicate and a system to check for similar words.

### Objective

Teams try to guess as many words as possible from their teammates' descriptions.

### Turns

Each turn is timed. Describers cannot use the word or its derivatives.

### Scoring

Points are awarded for each correct guess. Similar words are checked for validation.

### End Game

The game concludes after a predetermined number of rounds, with the highest-scoring team winning.

## Content

1. [System Requirements](#system-requirements)
2. [Base URL](#base-url)
3. [Install](#install)
4. [Setting Up Environment Variables](#setting-up-environment-variables)
5. [API Documentation](#api-documentation)
6. [Socket events](#socket-events)
7. [Database Schema](#database-schema)
8. [Security](#security)
9. [Deployment](#deployment)
10. [Future enhancements](#future-enhancements)

## System Requirements

- **Backend**: Node.js
- **Database**: MongoDB

## Base URL
http://localhost:3000

## Install
Project uses **Docker** to simplify development enviroment. Here are steps to install and run project.  
You must have installed in your local machine:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

First, clone this repository to your machine:
```bash
git clone https://github.com/JMSafadi/alias-game/
cd alias-game-app
```

Create and run containers with docker:
```bash
docker-compose up --build
```
To stop containers when you are done with application:
```bash
docker-compose down
```
If you want to delete volumes and restart database:
```bash
docker-compose down -v
docker-compose up --build
```

## Setting Up Environment Variables

1. **Copy the Example File:**

To create your own environment configuration, start by copying the example `.env.example` file to a new file named `.env` in the root directory of the project.

2. **Edit the '.env' file:**

Open the newly created `.env` file in a text editor and replace the placeholder values with your actual MongoDB credentials.

3. **Run the Application:**

Once you have set your environment variables, you can start the application with Docker.

## Note

Make sure to keep your `.env` file private and not share it in version control. The `.env` file is listed in `.gitignore` to prevent it from being tracked by Git.

## API documentation
The project also includes documented API using Swagger. This allows developers to explore and test endopoint directly from the Swagger UI, providing an interface for understandin the API's funcionality.  
Visit locally: http://localhost:3000/api
  
### 1. Endpoint /auth

Route that authenticates users identities.

### 1.1 Endpoint: `/auth/signup`

#### `POST` - Register new player

Register new player in game with email, username and password. Mandatory step to play.

**Request:**

```bash
curl -X 'POST'
'/auth'
-d
{
  "email": "johnDoe@examplemail.com"
  "username": "John Doe",
  "password": "securePassword"
}
```

**Response:**

```json
{
  "message": "Your registration has been successful. Now you can log in using your username: 'John Doe' or email: 'johnDoe@examplemail.com'."
}
```

Error Responses:

```
400 The username 'takenUsername' is already taken. Please choose another one.
400 The email 'takenEmail' is already in use. Please use another one.
400 Please provide a valid email address.
400 Username must be at least 4 characters long.
400 Password must be at least 6 characters long.
400 This field is required.
```

### 1.2 Endpoint: `/auth/login`

#### `POST` - Login

Allows users with active account to login.

**Request:**

```bash
curl -X 'POST'
'/auth'
-d
{
  "usernameOrEmail": "johnDoe@examplemail.com",
  "password": "securePassword"
}
```

**Response:**

```json
{
  "message": "Welcome back, 'username'!"
}
```

Error Responses:

```
401 Invalid credentials. Please verify the inputted information.
400 Username must be at least 4 characters long.
400 Password must be at least 6 characters long.
400 This field is required.
```

### 2. Endpoint /users

Route that manages users accounts.

### 2.1 Endpoint: `/users`

#### `GET` - List all existing users

Shows all existing users.

Request:

```bash
curl -X 'GET' '/users' \
```

**Response:**

```json
{
  "_id": "validId",
  "email": "johnDoe@examplemail.com",
  "username": "John Doe",
  "password": "hashedPassword"
}
```

Error Responses:

```
404 No active Users.
```

### 2.2 Endpoint: `/users/:id`

#### `GET` - Fetches information about the selected user

Shows the information of the selected user.

Request:

```bash
curl -X 'GET' '/users/:id' \
```

**Response:**

```json
{
  "email": "johnDoe@examplemail.com",
  "username": "John Doe",
  "password": "hashedPassword"
}
```

Error Responses:

```
404 User with ID 'missingID' not found.
400 Invalid user ID: 'notValidID'.
```

### 2.3 Endpoint: `/users/:id`

#### `PUT` - Updates a specific user's information

Allows the user to update it's profile's information.

Request:

```bash
curl -X 'PUT' '/users/validID' \
```

**Response:**

```json
{
  "message": "User's information updated successfully."
}
```

Error Responses:

```
404 User with ID missingUserID not found.
400 Invalid user ID: 'notValidID'.
400 Username must be at least 4 characters long.
400 Password must be at least 6 characters long.
400 This field is required.
400 Please provide a valid email address.
400 No changes detected. User's information unchanged.
409 Email takenEmail is already taken.
409 Username takenUsername is already taken
```

### 2.4 Endpoint: `/users/:id`

#### `DELETE` - Delete a specific user

Allows the deletion of a specific user by its ID.

Request:

```bash
curl -X 'DELETE' '/users/validID' \
```

**Response:**

```json
{
  "message": "User with ID validID deleted successfully."
}
```

Error Responses:

```
404 User with ID missingUserID not found.
400 Invalid user ID: 'notValidID'.
```

### 3. Endpoint /lobby

Route that manages game rooms, allowing players to create and join rooms, and facilitating team selection. This ensures that players are appropriately grouped before the game starts.

### 3.1 Endpoint: `/lobby`

#### `GET` - List all existing lobbies

Shows the user all existing lobbies.

Request:

```bash
curl -X 'GET' '/lobby' \
```

**Response:**

```json
    {
        "lobbyID": "validID",
        "lobbyOwner": "Player3",
        "playersPerTeam": 2,
        "maxPlayers": 4,
        "currentPlayers": 4,
        "players": [
            {
                "username": "Player3"
            },
            {
                "username": "Player11"
            },
            {
                "username": "Player2"
            },
            {
                "username": "Player5"
            }
        ]
    }
```

Error Responses:

```
404 No lobbies found, try creating your own!.
```

### 3.2 Endpoint: `/lobby/:id`

#### `GET` - Fetches information about the selected lobby

Shows the user the information of the selected lobby.

Request:

```bash
curl -X GET /lobby/:id
```

**Response:**

```json
{
  "lobbyOwner": "Player3",
  "playersPerTeam": 2,
  "maxPlayers": 4,
  "currentPlayers": 4,
  "players": [
    {
      "username": "Player3"
    },
    {
      "username": "Player11"
    },
    {
      "username": "Player2"
    },
    {
      "username": "Player5"
    }
  ]
}
```

Error Responses:

```
404 The specified lobby does not exist.
400 Lobby with ID notValidID not found.
```

### 3.3 Endpoint: `/lobby/create`

#### `POST` - Create a new game lobby

Allows a user to create a new game lobby. The creator becomes the lobby owner and can manage settings such as the number of players and teams.

**Request:**

```bash
curl -X 'POST' '/lobby/create' \
-H 'Content-Type: application/json' \
-d '{
  "userId": "validID",
  "playersPerTeam": 2
}'
```

**Response:**

```json
{
  "lobbyId": "123",
  "owner": "JohnDoe",
  "maxPlayers": 6,
  "teamCount": 2,
  "message": "Lobby created successfully."
}
```

Error Responses:

```
404 User Not Found: User with ID missingId not found..
400 Invalid User ID: 'notValidID'.
```

### 3.4 Endpoint: `/lobby/:id`

#### `PUT` - Update a specific lobby

Allows the user to update it's profile's information.

Request:

```bash
curl -X 'PUT '/lobby/validID' \
```

**Response:**

```json
{
  "message": "Lobby's information updated successfully."
}
```

Error Responses:

```
404 Lobby with ID missingLobbyID not found.
400 Invalid Lobby ID: 'notValidID'.
400 Lobby name takenLobbyName is already in use.
400 Cannot reduce players per team to 2 when there are 6 current players.
400 No changes detected. Lobby's information unchanged.
```

### 3.5 Endpoint: `/lobby/:id`

#### `DELETE` - Delete a specific lobby

Allows the deletion of a specific lobby by its ID.

Request:

```bash
curl -X 'DELETE' '/lobby/validID' \
```

**Response:**

```json
{
  "message": "Lobby with ID validID deleted successfully."
}
```

Error Responses:

```
404 Lobby with ID missingLobbyID not found.
400 Invalid Lobby ID: 'notValidID'.
```

### 3.6 Endpoint: `/lobby/join`

#### `POST` - Join an existing game lobby

Allows a player to join a specified lobby, given that the lobby isn't full. Players will be added to teams automatically based on
available spots.

**Request:**

```bash
curl -X 'POST' '/lobby/join' \
-H 'Content-Type: application/json' \
-d '{
  "userId": "validUserID",
  "lobbyId": "validLobbyID"
}'
```

**Response:**

```json
{
  "lobbyId": "123",
  "username": "JaneDoe",
  "message": "Successfully joined the lobby."
}
```

Error Responses:

```
404 Lobby with ID notValidID not found.
400 Lobby Full: The lobby has reached its player capacity.
400 Lobby Full: User is already in another lobby.
400 Lobby Full: User is already in the lobby.
400 userId must be a string.
400 lobbyId must be a string.
```

### 3.7 Endpoint: `/lobby/teams`

#### `POST` - Assign players to teams

Assigns players to teams in the lobby before the game starts.

Request:

```bash
curl -X 'POST' '/lobby/teams' \
-H 'Content-Type: application/json' \
-d '{
  "lobbyId": "validID",
  "teams": [
    {
      "teamName": "Team 1",
      "players": ["Player1_ID", "Player2_ID"]
    },
    {
      "teamName": "Team 2",
      "players": ["Player3_ID", "Player4_ID"]
    }
  ]
}'
```

**Response:**

```json
{
  "lobbyId": "validID",
  "teams": [
    {
      "teamName": "Team 1",
      "players": ["Player1", "Player2"]
    },
    {
      "teamName": "Team 2",
      "players": ["Player3", "Player4"]
    }
  ],
  "message": "Teams assigned successfully."
}
```

Error Responses:

```
404 The specified lobby does not exist.
404 The specified lobby does not exist.
400 Invalid Team Assignment: Some players are missing or already
assigned.
```

### 4. Endpoint /chat

Route that retrieves chat history within the game.

#### `GET` - `/chat/history`

- Retrieves the chat history for the entire game session.

**Request:**

```bash
curl -X 'GET' '/chat/history'
```

**Response:**

```json
[
   {
        "_id": "670e83898d1fab6fac166e0e",
        "content": "Message from Marlena",
        "sender": "670e28947bb788a7dd5a3d41",
        "messageType": "chat",
        "senderTeamName": "Team A",
        "role": "chat",
        "lobbyId": "670e828e8d1fab6fac166db0",
        "timestamp": "2024-10-10T10:10:00.000Z",
        "__v": 0
    },
    {
        "_id": "670e83978d1fab6fac166e1a",
        "content": "Message from Ignacio",
        "sender": "670e28987bb788a7dd5a3d43",
        "messageType": "chat",
        "senderTeamName": "Team A",
        "role": "chat",
        "lobbyId": "670e828e8d1fab6fac166db0",
        "timestamp": "2024-10-10T10:10:00.000Z",
        "__v": 0
    }
]
```

Error Responses:

```
500 Internal server error. Failed to retrieve chat history.
```

## Socket Events

### `start_game`

Client sends this event to start the game once teams and players have been set up in a lobby.

**Payload**

```json
{
  "lobbyId": "123"
}
```

### `game_started`

When the `start_game` event is sent, the server responds with the `game_started` event to initialize the game.

**Response**

```json
{
  "message": "Game started!",
  "game": {
    "lobbyId": "123",
    "teamsInfo": [
      {
        "teamName": "Team A",
        "players": ["user1", "user2"],
        "score": 0
      },
      {
        "teamName": "Team B",
        "players": ["user3", "user4"],
        "score": 0
      }
    ],
    "rounds": 5,
    "timePerTurn": 30
  }
}
```

### `turn_started`

When the game starts, the server automatically initializes the first turn for one team, generating a word to guess.

**Response**

```json
{
  "message": "Turn started for team: Team A. user1 is the describer!",
  "round": 1,
  "turn": 1,
  "time": 30,
  "wordToGuess": "garden",
  "teamName": "Team A",
  "describer": "user1"
}
```

### `send_message`

Client sends this event to send a chat message during the game.

**Payload**

```json
{
  "content": "This is a message from user1",
  "sender": "user1",
  "messageType": "chat",
  "senderTeamName": "Team A",
  "gameId": "6701c9c2392f862da89aa423",
  "lobbyId": "123"
}
```

**Response**

The server emits the `receive_message` event to all clients in the lobby.

```json
{
  "content": "This is a message from user1",
  "sender": "user1",
  "messageType": "chat",
  "senderTeamName": "Team A",
  "lobbyId": "123",
  "timestamp": "2024-10-14T15:00:00Z"
}
```

### `guess_word`

Client sends this event when the team playing the turn tries to guess the word.

**Payload**

```json
{
  "gameId": "6701c9c2392f862da89aa423",
  "teamName": "Team A",
  "content": "sofa",
  "sender": "user2"
}
```

If the guess is incorrect:

### `incorrect_guess`

**Response**

```json
{
  "message": "Player user2 guessed the word incorrectly.",
  "team": "Team A"
}
```

If the guess is correct:

### `correct_guess`

**Response**

```json
{
  "message": "Player user2 has guessed the word correctly!",
  "team": "Team A",
  "score": 10
}
```

### `turn_ended`

Emitted when a turn ends, either due to a timeout or a correct guess.

**Response**

```json
{
  "message": "Turn ended for Team A. The word was: garden."
}
```

### `score_updated`

Emitted when the team's score is updated.

**Response**

```json
{
  "message": "Team Team A scored points!",
  "teamName": "Team A",
  "score": 12
}
```

### `game_over`

Emitted when the game ends.

**Response**

```json
{
  "message": "Game over! The winner is Team B. Congratulations!",
  "score": 12
}
```

### `points_deducted`

Emitted when points are deducted from a team for using similar or forbidden words.

**Response**

```json
{
  "message": "10 points have been deducted from Team A for using similar words.",
  "team": "Team A",
  "score": 5
}
```

### `warning`

Emitted when a describer uses words that are too similar to the word to be guessed.

**Response**

```json
{
  "message": "WARNING: Player user1, you can't use words that are too similar.",
  "team": "Team A"
}
```

### `gameEnded`

Emitted when the game is over, providing the final outcome.

**Response**

```json
{
  "message": "Game over! The winner is Team B with 20 points. Congratulations!"
}
```

### `turn_ended`

Emitted when the turn ends due to timeout or another event.

**Response**

```json
{
  "message": "Turn ended for Team A. The word was 'rhinoceros'."
}
```

## Database Schema
### User model
| Field                | Type       | Description                                                |
| :--------------------| :----------| :----------------------------------------------------------|
| `username`            |  `string`  | User name. (unique)                                       |
| `password`             |  `string`  | User password.                          |


### Message model
| Field                | Type       | Description                                                |
| :--------------------| :----------| :----------------------------------------------------------|
| `content`            |  `string`  | Content of the message message.                                |
| `sender`             |  `string`  | Identifier of the message sender.                           |
| `messageType`        |  `string`  | Type of the message (e.g., 'chat', 'describe', 'guess').    |
| `senderTeamName`     |  `string`  | The team name of the sender, if applicable.                 |
| `role`               |  `string`  | Role of the sender (e.g., 'describer', 'player').           |
| `lobbyId`            |  `string`  | Identifier of the lobby where the message was sent.         |
| `timestamp`          |  `Date`    | Timestamp when the message was sent. Defaults to current date and time. |

### Game model

| Field                  | Type       | Description                                                                                                                                                                                                                           |
| :--------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_id`                  | `ObjectId` | Unique ID generated automatically,                                                                                                                                                                                                    |
| `teamsInfo`            | `Array`    | Teams information including:<br> - `teamName`: team name.<br>- `players`: List with players name.<br>- `score`: Total team score.                                                                                                     |
| `rounds`               | `Number`   | Total rounds in game,                                                                                                                                                                                                                 |
| `timePerTurn`          | `Number`   | Time (in seconds) assign for each turn.                                                                                                                                                                                               |
| `currentRound`         | `Number`   | Current playing being played,                                                                                                                                                                                                         |
| `playingTurn`          | `Number`   | Current turn being played. The total, before jumping next round, is equal to the number of teams.                                                                                                                                     |
| `createdAt`            | `Date`     | Game creation date time.                                                                                                                                                                                                              |
| `__v`                  | `Number`   | Document version (MongoDB internal management)                                                                                                                                                                                        |
| `currentTurn`          | `Object`   | Current turn being played information including:<br>- `teamName`: team name playing.<br>- `wordToGuess`: word to play.<br>- `isTurnActive`: boolean indicating if turn is active.<br>- `_id`: unique turn id generated automatically. |
| `currentTurnStartTime` | `Number`   | Timestamp indicating that turn init. Used to calculate score.                                                                                                                                                                         |

## Security

### 1. Authentication

The system uses **JSON Web Tokens (JWT)** to authenticate users.

- **Registration and login**: Players must register with an email, username, and password. To log in, they can use their email or username along with their password.
- **JWT Tokens**: Once the user successfully logs in, they receive a JWT token that must be included in the headers to access protected routes in the system. The token has a configurable expiration time set in the environment variables file.

  **Header**:

  ```json
  {
    "Authorization": "Bearer <JWT_TOKEN>"
  }
  ```

### 2. Authorization

The system uses Role-Based Access Control (RBAC) to control access to different routes and features depending on the user's role.

**Roles**: Assigned at registration or updated later. Examples include user or admin.

**User**": Users have limited access. They can join game lobbies, participate in games, and send messages in the chat. However, they cannot modify or delete other users, lobbies, or administrative settings.
**Admin**: Admins have full access to the system. They can manage users, create and delete lobbies, view and manage all game data, and perform actions restricted from regular users.

**Protected routes**: Specific routes are restricted based on roles, and role-based guards are used to secure them.

### 3. Data Protection

The application protects sensitive user data through:

**Password encryption**: Passwords are encrypted using bcrypt before storing them in the database.
**Token protection**: JWT tokens are securely generated with an expiration time to prevent abuse.
**Environment variables**: Sensitive information, such as database credentials, is stored in environment variables and excluded from version control (.gitignore).

### 4. Data Validation

The application enforces strict validation of user input:

**Data sanitization**: Input is validated in route controllers and Data Transfer Objects (DTOs) to ensure correct and safe data.
**Password strength**: Passwords must meet security criteria like length and character combinations.

## Deployment

## Future Enhancements
- **Raking system**: implement a ranking system to track and display user's score and achivements, making the game more competitive.
  
- **Private messaging**: enable private messages between game users.
  
- **Difficulty selection**: players will be allow to choose the difficulty level for the game, among other game options.
  
