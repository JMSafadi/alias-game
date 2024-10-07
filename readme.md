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
4. [Set Up Enviroment](#set-up-enviroment)
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

## Install

## Setting Up Environment Variables

1. **Copy the Example File:**

To create your own environment configuration, start by copying the example `.env.example` file to a new file named `.env` in the root directory of the project.

2. **Edit the '.env' file:**

Open the newly created `.env` file in a text editor and replace the placeholder values with your actual MongoDB credentials.

3. **Run the Application:**

Once you have set your environment variables, you can start the application with Docker.

## Note

Make sure to keep your `.env` file private and not share it in version control. The `.env` file is listed in `.gitignore` to prevent it from being tracked by Git.

## API Documentation

### 1. Endpoint /auth

#### `POST` - `/auth`

Register new player in game with name and password. Mandatory step to play.

**Request:**

```bash
curl -X 'POST'
'/auth'
-d
{
  "username": "John Doe",
  "password": "password123"
}

```

**Response:**

```json
{
  "message": "Registered user"
}
```

### 2. Endpoint /lobby

Route that manages game rooms, allowing players to create and join rooms, and facilitating team selection. This ensures that players are appropriately grouped before the game starts.

### 2.1 Endpoint: `/lobby`

#### `GET` - List all existing lobbies

Shows the user all existing lobbies.

Request:

```bash
curl -X 'GET' '/lobby' \
```

Response:

```
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
404 Lobby Not Found: No lobbies found, try creating your own!.
```

### 2.2 Endpoint: `/lobby/:id`

#### `GET` - Fetch information about the selected lobby

Shows the user the information of the selected lobby.

Request:

```bash
curl -X GET /lobby/:id
```

Response:

```
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
404 Lobby Not Found: The specified lobby does not exist.
```

### 2.3 Endpoint: `/lobby/create`

#### `POST` - Create a new game lobby

Allows a user to create a new game lobby. The creator becomes the lobby owner and can manage settings such as the number of players and teams.

- Players per team must be between 2 and 5.
- The lobby will always have 2 teams.

Request:

```bash
curl -X 'POST' '/lobby/create' \
-H 'Content-Type: application/json' \
-d '{
  "userId": "validID",
  "playersPerTeam": 2
}'
```

Response:

```
{
    "lobbyOwner": "Player3",
    "playersPerTeam": 2,
    "maxPlayers": 4,
    "currentPlayers": 1,
    "players": [
        {
            "username": "Player3"
        }
    ]
}
```

Error Responses:

```
404 User Not Found: User with ID notValidID not found.
400 User is already in another lobby.
400 The minimum number of players is 2.
400 The maximum number of players is 5.
400 userId must be a string.
```

### 2.4 Endpoint: `/lobby/join`

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

Response:

```
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
404 Lobby Not Found: Lobby with ID notValidID not found.
400 Lobby Full: The lobby has reached its player capacity.
400 Lobby Full: User is already in another lobby.
400 Lobby Full: User is already in the lobby.
400 userId must be a string.
400 lobbyId must be a string.

```

### 2.5 Endpoint: `/lobby/teams`

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
  "message": "Teams assigned successfully. The game is about to start!"
}
```

Error Responses:

```
404 Lobby Not Found: Invalid lobby ID: notValidID.
404 Lobby Not Found: Lobby with ID nonExistentID not found.
400 Invalid Team Assignment: Invalid Team Assignment: Some players are not in the lobby.
400 Invalid Team Assignment: Incorrect number of players.
400 lobbyId must be a string.
400 values in players must be a string.
```

### 2.6 Endpoint: `/lobby/:id`

#### `DELETE` - Delete a specific lobby

Allows the deletion of a specific lobby by its ID.

Request:

```bash
curl -X 'DELETE' '/lobby/validID' \
```

Response:

```
{
  "message": "Lobby with ID validID deleted successfully."
}
```

Error Responses:

```
404 Lobby Not Found: Lobby with ID notValidID not found.
400 Invalid Lobby ID: The provided ID is not a valid format.
```

### 3. Endpoint /game

Route that handles the core logic of the game. Including match initiation, turn managment, and player interactions.

##### `POST` - `/game/start`

- Init a new game when lobby is full.

Request:

```
curl -X 'POST'
'/game/start'
-d
{
  "lobbyId": "123",
  "teams": [
    {
      "teamName": "Team A",
      "players": ["user1", "user2"]
    },
    {
      "teamName": "Team B",
      "players": ["user3", "user4"]
    }
  ]
}
```

Response:

```
{
  "gameId": "789",
  "message": "Game started!"
}
```

##### `POST` - `/game/turn/start`

- Init turn for one team. Generates the word to guess and turn time.

Request:

```
curl -X 'POST'
'/game/turn/start'
-d
{
  "gameId": "789",
  "teamId": "teamA"
}
```

Response:

```
{
  "word": "rabbit",
  "timeRemaining:" 60
}
```

##### `POST` - `/game/turn/guess`

- Send guess attempt

Request:

```
curl -X 'POST'
'/game/turn/guess'
-d
{
  "gameId": "789",
  "teamId": "teamA",
  "guess": "rabbit"
}
```

Response:

```
{
  "correct": "false",
}
```

##### `POST` - `/game/turn/pass`

- Jumps to next turn if team guess word or if time has run out.

Request:

```
curl -X 'POST'
'/game/turn/pass'
-d
{
  "gameId": "789",
  "teamId": "teamA",
  "reason": "time"
}
```

Response:

```
{
  "message": "Time expired due to timeout."
}
```

##### `POST` - `/game/end`

- End game and show results.

Request:

```
curl -X 'POST'
'/game/end'
-d
{
  "gameId": "789"
}
```

Response

```
{
  "finalScores": {
    "teamA": 5,
    "teamB": 3
  },
  "message": "Game finished. Team A wins!"
}
```

### 4. Endpoint /chat

Route that handles all chat functionalities within the game, allowing players to send messages and retrieve chat history in real-time.

#### `POST` - `/chat/send`

- Sends a message in the game lobby.

**Request:**

```bash
curl -X 'POST' '/chat/send' -d {
  "lobbyId": "123",
  "username": "John Doe",
  "message": "Let's start the game!"
}
```

**Response:**

```json
{
  "message": "Message sent successfully",
  "timestamp": "2024-09-27T15:00:00Z"
}
```

#### `GET` - `/chat`

- Retrieves the chat history for a specific lobby.

**Request:**

```bash
curl -X 'GET' '/chat?lobbyId=123'
```

**Response:**

```json
{
  "messages": [
    {
      "username": "John Doe",
      "message": "Let's start the game!",
      "timestamp": "2024-09-27T15:00:00Z"
    },
    {
      "username": "Jane Doe",
      "message": "Ready to play!",
      "timestamp": "2024-09-27T15:01:00Z"
    }
  ]
}
```

### 5. Endpoint /words

Route that manages word validation and retrieves similar words to enhance gameplay and prevent obvious clues.

#### `POST` - `/words/validate`

- Validates if the guessed word is correct.

**Request:**

```bash
curl -X 'POST' '/words/validate' -d {
  "word": "rabbit"
}
```

**Response:**

```json
{
  "valid": true,
  "message": "The word is valid."
}
```

#### `GET` - `/words/similar`

- Retrieves a list of similar words that cannot be used by describers.

**Request:**

```bash
curl -X 'GET' '/words/similar?word=rabbit'
```

**Response:**

```json
{
  "similarWords": ["bunny", "hare", "lagomorph"]
}
```

## Socket Events

`startGame`  
Client sent event to start the game once teams and players have veen set up in a lobby.

**Payload**

```json
{
  "teamsInfo": [
    {
      "teamName": "Team A",
      "players": ["user1", "user2"]
    },
    {
      "teamName": "Team B",
      "players": ["user3", "user4"]
    }
  ],
  "rounds": 5,
  "timePerTurn": 30
}
```

`gameStarted `

When start-game event is sent, server response with event game-started to init game.

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

`turnStarted`  
When game starts, automatically init the first turn for one team generating word to guess.

```json
{
  "message": "Turn started for team: Team A",
  "wordToGuess": "garden"
}
```

`guessWord`  
Client sent event when the team playing the turn, try to guess the word.

**Payload:**

```json
{
  "gameId": "6701c9c2392f862da89aa423",
  "teamName": "Team A",
  "guessWord": "sofa"
}
```

If guess is incorrect:

`guessFailed`

```json
{
  "message": "Incorrect word! Team lost 5 points. Try again."
}
```

If guess is correct:

`turnEnded`

```json
{
  "message": "Correct word guessed! Turn ended"
}
```

`scoreUpdated`

```json
{
  "message": "Team Team A scored points!",
  "teamName": "Team A",
  "score": 12
}
```

`gameEnded`

```json
{
  "message": "Game over! The winner is Team B. Congratulations!",
  "score": 12
}
```

## Database Schema

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

## Deployment

## Future Enhancements
