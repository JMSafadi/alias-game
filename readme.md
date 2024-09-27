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


### 5. Endpoint /words



