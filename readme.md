# Alias game

## Content
1. [Description](#description)
2. [Technical requirements](#technical-requirements)
3. [Base URL](#base-url)
4. [Install](#install)

## Description
Alias is a word-guessing game where players form teams. Each team takes turns where one member describes a word and others guess it. The game includes a chat for players to communicate and a system to check for similar words.

## Technical requirements

## Base URL


## API Documentation
### 1. Endpoint /auth
#### `POST` - `/auth`
Register new player in game with name and password. Mandatory step to play.

Request:
```
curl -X 'POST'
'/auth'
-d
{
  "username": "John Doe",
  "password": "password123"
}

```
Response:
```
{
  "message": "Registered user"
}
```

### 2. Endpoint /lobby
Route that manages game rooms, allowing players to create and join rooms, and facilitating team selection. This ensures that players are appropriately grouped before the game starts.

### 2.1 Endpoint: `/lobby/create`
#### `POST` - Create a new game lobby

Allows a user to create a new game lobby. The creator becomes the lobby owner and can manage settings such as the number of players and teams.

Request:
```bash
curl -X 'POST' '/lobby/create' \
-H 'Content-Type: application/json' \
-d '{
  "username": "JohnDoe",
  "maxPlayers": 6,
  "teamCount": 2
}'
```

Response:
```
{
  "lobbyId": "123",
  "owner": "JohnDoe",
  "maxPlayers": 6,
  "teamCount": 2,
  "message": "Lobby created successfully."
}
```

### 2.2 Endpoint: `/lobby/join`
#### `POST` - Join an existing game lobby
Allows a player to join a specified lobby, given that the lobby 
isn't full.

Request:
```bash
curl -X 'POST' '/lobby/join' \
-H 'Content-Type: application/json' \
-d '{
  "username": "JaneDoe",
  "lobbyId": "123"
}'
```

Response:
```
{
  "lobbyId": "123",
  "username": "JaneDoe",
  "message": "Successfully joined the lobby."
}
```

Error Responses:

```
404 Lobby Not Found: The specified lobby does not exist.
400 Lobby Full: The lobby has reached its player capacity.
```
### 2.3 Endpoint: `/lobby/teams`
#### `POST` - Assign players to teams
Assigns players to teams in the lobby before the game starts.

Request:
```bash
curl -X 'POST' '/lobby/teams' \
-H 'Content-Type: application/json' \
-d '{
  "lobbyId": "123",
  "teams": [
    {
      "teamName": "Team A",
      "players": ["JohnDoe", "JaneDoe"]
    },
    {
      "teamName": "Team B",
      "players": ["Player3", "Player4"]
    }
  ]
}'
```

Response:
```
{
  "lobbyId": "123",
  "teams": [
    {
      "teamName": "Team A",
      "players": ["JohnDoe", "JaneDoe"]
    },
    {
      "teamName": "Team B",
      "players": ["Player3", "Player4"]
    }
  ],
  "message": "Teams assigned successfully."
}
```

Error Responses:
```
404 Lobby Not Found: The specified lobby does not exist.
400 Invalid Team Assignment: Some players are missing or already
assigned.
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
  "timePerTurn": 60,
  "createdAt": "2024-10-01T15:29:40.495Z"
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
  "teamName": "Team A"
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




### Setting Up Environment Variables  

1. **Copy the Example File:**  

To create your own environment configuration, start by copying the example `.env.example` file to a new file named `.env` in the root directory of the project.

2. **Edit the '.env' file:**  

Open the newly created `.env` file in a text editor and replace the placeholder values with your actual MongoDB credentials.

3. **Run the Application:**  

Once you have set your environment variables, you can start the application with Docker.

## Note  

Make sure to keep your `.env` file private and not share it in version control. The `.env` file is listed in `.gitignore`  to prevent it from being tracked by Git.