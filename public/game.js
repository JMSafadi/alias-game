// Navbar burger handling for mobile devices
document.addEventListener('DOMContentLoaded', () => {
  const navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll('.navbar-burger'),
    0,
  );

  if (navbarBurgers.length > 0) {
    navbarBurgers.forEach((el) => {
      el.addEventListener('click', () => {
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
  }

  // Check if user is logged in when the page loads
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  if (token && username) {
    // Updating the user interface
    document.getElementById('userEmail').textContent = username;
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('registerButton').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'inline-block';

    // Initialize socket connection
    initSocketConnection();
  }
});

// Variables
let socket;
let currentGameId; // Variable storing the current gameId

// Opening and closing the login modal
function openLoginModal() {
  document.getElementById('loginModal').classList.add('is-active');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('is-active');
  document.getElementById('loginError').textContent = '';
}

// Opening and closing the registration modal
function openRegisterModal() {
  document.getElementById('registerModal').classList.add('is-active');
}

function closeRegisterModal() {
  document.getElementById('registerModal').classList.remove('is-active');
  document.getElementById('registerError').textContent = '';
}

// Login function
async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const loginError = document.getElementById('loginError');

  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);

      // Updating the user interface
      document.getElementById('userEmail').textContent = username;
      document.getElementById('loginButton').style.display = 'none';
      document.getElementById('registerButton').style.display = 'none';
      document.getElementById('logoutButton').style.display = 'inline-block';

      closeLoginModal();

      // Initialize socket connection after login
      initSocketConnection();
    } else {
      const errorData = await response.json();
      loginError.textContent = errorData.message || 'Login failed.';
    }
  } catch (error) {
    console.error('Login error:', error);
    loginError.textContent = 'An error occurred during login.';
  }
}

// Registration function
async function register() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById(
    'registerConfirmPassword',
  ).value;
  const registerError = document.getElementById('registerError');

  if (password !== confirmPassword) {
    registerError.textContent = 'Passwords do not match.';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);

      // Updating the user interface
      document.getElementById('userEmail').textContent = username;
      document.getElementById('loginButton').style.display = 'none';
      document.getElementById('registerButton').style.display = 'none';
      document.getElementById('logoutButton').style.display = 'inline-block';

      closeRegisterModal();

      // Initialize socket connection after registration
      initSocketConnection();
    } else {
      const errorData = await response.json();
      registerError.textContent = errorData.message || 'Registration failed.';
    }
  } catch (error) {
    console.error('Registration error:', error);
    registerError.textContent = 'An error occurred during registration.';
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');

  // Updating the user interface
  document.getElementById('userEmail').textContent = '';
  document.getElementById('loginButton').style.display = 'inline-block';
  document.getElementById('registerButton').style.display = 'inline-block';
  document.getElementById('logoutButton').style.display = 'none';

  // Disconnect socket
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Initialize socket connection
function initSocketConnection() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  if (!token) {
    console.warn('No token. User is not logged in.');
    return;
  }

  // Updating user interface with username
  document.getElementById('userEmail').textContent = username;
  document.getElementById('loginButton').style.display = 'none';
  document.getElementById('registerButton').style.display = 'none';
  document.getElementById('logoutButton').style.display = 'inline-block';

  const lobbyId = localStorage.getItem('lobbyId');

  // Connect to Socket.io server
  socket = io('http://localhost:3000/game', {
    query: { token, lobbyId },
  });

  // Socket event handling
  socket.on('connect', () => {
    console.log('Connected to server.');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server.');
  });

  socket.on('gameStarted', function (data) {
    console.log('Game started:', data);
    currentGameId = data.game._id; // Save gameId
  });

  socket.on('turnStarted', function (data) {
    try {
      console.log('Received turnStarted event:', data);
      if (data) {
        document.getElementById('currentRound').textContent =
          `Current Round: ${data.round}`;
        document.getElementById('currentTeam').textContent =
          `Current Team: ${data.teamName}`;
        document.getElementById('currentDescriber').textContent =
          `Describer: ${data.describer}`;
        document.getElementById('wordToGuess').textContent =
          `Word to Guess: ${data.wordToGuess}`;
      } else {
        console.warn('Received empty data for turnStarted event.');
      }
    } catch (error) {
      console.error('Error handling turnStarted event:', error);
    }
  });

  socket.on('receive_message', function (data) {
    console.log('Received message:', data);
    const messagesDiv = document.getElementById('messages');

    const messageElement = document.createElement('div');
    messageElement.textContent = `[${data.senderTeamName}] ${data.sender}: ${data.content}`;
    messagesDiv.appendChild(messageElement);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Function to start the game
function startGame() {
  const lobbyId = localStorage.getItem('lobbyId');

  if (!lobbyId) {
    alert('You must join a lobby first.');
    return;
  }

  if (socket && socket.connected) {
    socket.emit('startGame', { lobbyId });
  } else {
    alert('Failed to connect to server. Please try again.');
  }
}

// Joining a Lobby
async function joinLobby(lobbyId) {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('You must be logged in to join a lobby.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/lobby/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lobbyId }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('lobbyId', lobbyId);
      alert('Joined lobby successfully.');

      // Reconnect socket with new lobbyId
      if (socket) {
        socket.disconnect();
      }
      initSocketConnection();
    } else {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to join lobby.');
    }
  } catch (error) {
    console.error('Error joining lobby:', error);
    alert('An error occurred while joining the lobby.');
  }
}

// Function to send a message
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput ? messageInput.value : '';

  if (!message) {
    alert('Message cannot be empty!');
    return;
  }

  const messageType = document.getElementById('isGuess').checked
    ? 'guess'
    : document.getElementById('isDescribe').checked
      ? 'describe'
      : 'chat';

  const username = localStorage.getItem('username');

  if (!username) {
    alert('You must be logged in to send a message.');
    return;
  }

  if (!currentGameId) {
    alert('The game has not started yet.');
    return;
  }

  socket.emit('send_message', {
    content: message,
    sender: username,
    gameId: currentGameId,
    // You can add senderTeamName if it's available in your logic
    messageType,
  });

  messageInput.value = '';
}
