// Chess game server using Socket.io
const http = require('http');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');

// Create HTTP server
const server = http.createServer();

// Create Socket.io server with CORS settings
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://kidist-selassie.org',
      'https://www.kidist-selassie.org'
    ],
    methods: ['GET', 'POST']
  }
});

// Store active games
const games = {};

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle creating a new game
  socket.on('createGame', ({ matchId, playerId }) => {
    console.log(`Creating game: ${matchId} by player ${playerId}`);
    
    // Initialize with a new chess game
    if (!games[matchId]) {
      // Randomly determine if creator is white or black
      const isCreatorWhite = Math.random() < 0.5;
      
      games[matchId] = {
        chess: new Chess(),
        players: {
          white: isCreatorWhite ? playerId : null,
          black: isCreatorWhite ? null : playerId
        },
        spectators: [],
        status: 'waiting' // waiting, active, complete
      };
      
      // Join the game room
      socket.join(matchId);
      
      // Emit game created event
      socket.emit('gameCreated', {
        matchId,
        color: isCreatorWhite ? 'white' : 'black',
        fen: games[matchId].chess.fen(),
        status: games[matchId].status
      });
    } else {
      socket.emit('error', { message: 'Game already exists' });
    }
  });

  // Handle joining a game
  socket.on('joinGame', ({ matchId, playerId }) => {
    console.log(`Player ${playerId} joining game: ${matchId}`);
    
    if (games[matchId]) {
      const game = games[matchId];
      
      // Check if there's an open spot
      if (!game.players.white || !game.players.black) {
        const assignedColor = !game.players.white ? 'white' : 'black';
        game.players[assignedColor] = playerId;
        game.status = 'active'; // Both players joined, game is active
        
        // Join the game room
        socket.join(matchId);
        
        // Emit game joined event to the player
        socket.emit('gameJoined', {
          matchId,
          color: assignedColor,
          fen: game.chess.fen(),
          status: game.status
        });
        
        // Notify all players in the room that the game is starting
        io.to(matchId).emit('gameStarted', {
          matchId,
          fen: game.chess.fen(),
          status: game.status,
          turn: game.chess.turn()
        });
      } else {
        // Game is full, join as spectator
        game.spectators.push(playerId);
        socket.join(matchId);
        socket.emit('gameJoined', {
          matchId,
          color: 'spectator',
          fen: game.chess.fen(),
          status: game.status
        });
      }
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  // Handle making a move
  socket.on('makeMove', ({ matchId, playerId, from, to, promotion }) => {
    console.log(`Move in game ${matchId} by player ${playerId}: ${from} to ${to}`);
    
    if (games[matchId]) {
      const game = games[matchId];
      
      // Determine if the player is allowed to make this move
      const playerColor = game.players.white === playerId ? 'w' : 'b';
      
      if (game.chess.turn() === playerColor) {
        try {
          // Attempt to make the move
          const move = game.chess.move({ from, to, promotion });
          
          if (move) {
            // Move was successful, broadcast the new state
            const gameState = {
              matchId,
              fen: game.chess.fen(),
              turn: game.chess.turn(),
              lastMove: { from, to },
              isCheck: game.chess.inCheck(),
              isCheckmate: game.chess.isCheckmate(),
              isDraw: game.chess.isDraw(),
              isGameOver: game.chess.isGameOver()
            };
            
            // Update game status if game is over
            if (game.chess.isGameOver()) {
              game.status = 'complete';
              gameState.status = 'complete';
              
              if (game.chess.isCheckmate()) {
                gameState.winner = playerColor === 'w' ? 'white' : 'black';
              } else {
                gameState.result = 'draw';
              }
            }
            
            // Broadcast to all players in the room
            io.to(matchId).emit('moveMade', gameState);
          } else {
            socket.emit('error', { message: 'Invalid move' });
          }
        } catch (error) {
          console.error('Error making move:', error);
          socket.emit('error', { message: 'Error making move' });
        }
      } else {
        socket.emit('error', { message: 'Not your turn' });
      }
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  // Handle resignation
  socket.on('resignGame', ({ matchId, playerId }) => {
    if (games[matchId]) {
      const game = games[matchId];
      
      // Check if player is part of the game
      if (game.players.white === playerId || game.players.black === playerId) {
        const resignedColor = game.players.white === playerId ? 'white' : 'black';
        const winnerColor = resignedColor === 'white' ? 'black' : 'white';
        
        game.status = 'complete';
        
        // Notify all players
        io.to(matchId).emit('gameOver', {
          matchId,
          result: 'resignation',
          winner: winnerColor,
          resignedBy: resignedColor
        });
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Handle any cleanup needed for games the player was in
    // This could include notifying other players of disconnection
  });
});

// Start the server on port 8000
server.listen(8000, () => {
  console.log('Chess server listening on port 8000');
});

