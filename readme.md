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

## API
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

Route that handles all chat functionalities within the game, allowing players to send messages and retrieve chat history in real-time.

#### `POST` - `/chat/send`

- Sends a message in the game lobby.

**Request:**

```bash
curl -X 'POST' '/chat/send' 
-d 
{
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
curl -X 'POST' '/words/validate' 
-d 
{
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
``startGame``  
Client sent event to start the game once teams and players have been set up in a lobby.  
  
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
### User model
| Field                | Type       | Description                                                |
| :--------------------| :----------| :----------------------------------------------------------|
| `username`            |  `string`  | User name. (unique)                                       |
| `password`             |  `string`  | User password.                          |


### Chat model
| Field                | Type       | Description                                                |
| :--------------------| :----------| :----------------------------------------------------------|
| `content`            |  `string`  | Content of the chat.                                       |
| `sender`             |  `string`  | Identifier of the message sender.                          |
| `timestamp`          |  `Date`    | Timestamp when the message was sent.                       |


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
  