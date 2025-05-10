// Chess game server using Socket.io
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { Chess, Square, Color } from 'chess.js';

// Create HTTP server
const app = express();
const server = http.createServer(app);

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

// Define types for our game state
type PlayerColor = 'white' | 'black';
type GameStatus = 'waiting' | 'active' | 'complete';

interface ChessGame {
  chess: Chess;
  players: {
    white: string | null;
    black: string | null;
  };
  spectators: string[];
  status: GameStatus;
  winner?: PlayerColor | 'draw';
  result?: string;
}

interface CreateGameParams {
  matchId: string;
  playerId: string;
}

interface JoinGameParams {
  matchId: string;
  playerId: string;
}

interface MovePieceParams {
  matchId: string;
  playerId: string;
  from: string;
  to: string;
  promotion?: string;
}

interface GameStateUpdate {
  matchId: string;
  fen: string;
  turn: Color;
  lastMove?: {
    from: string;
    to: string;
  };
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  status?: GameStatus;
  winner?: PlayerColor | 'draw';
  result?: string;
}

// Store active games
const games: Record<string, ChessGame> = {};

// Convert chess.js color ('w'/'b') to our color format ('white'/'black')
function chessColorToPlayerColor(color: Color): PlayerColor {
  return color === 'w' ? 'white' : 'black';
}

// Convert our color ('white'/'black') to chess.js color ('w'/'b')
function playerColorToChessColor(color: PlayerColor): Color {
  return color === 'white' ? 'w' : 'b';
}

// Handle socket connections
io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle creating a new game
  socket.on('createGame', ({ matchId, playerId }: CreateGameParams) => {
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
      
      // Emit game created event with player's color assignment
      socket.emit('gameCreated', {
        matchId,
        playerColor: isCreatorWhite ? 'white' : 'black',
        fen: games[matchId].chess.fen(),
        status: games[matchId].status
      });
    } else {
      // Game already exists
      socket.emit('error', { message: 'Game already exists' });
    }
  });

  // Handle joining a game
  socket.on('joinGame', ({ matchId, playerId }: JoinGameParams) => {
    console.log(`Player ${playerId} joining game: ${matchId}`);
    
    const game = games[matchId];
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    // Check if there is an open slot
    if (game.players.white === null) {
      game.players.white = playerId;
      socket.join(matchId);
      socket.emit('gameJoined', {
        matchId,
        playerColor: 'white',
        fen: game.chess.fen(),
        status: game.status
      });
      game.status = 'active';
    } else if (game.players.black === null) {
      game.players.black = playerId;
      socket.join(matchId);
      socket.emit('gameJoined', {
        matchId,
        playerColor: 'black',
        fen: game.chess.fen(),
        status: game.status
      });
      game.status = 'active';
    } else {
      // Join as spectator
      game.spectators.push(playerId);
      socket.join(matchId);
      socket.emit('gameJoined', {
        matchId,
        playerColor: 'spectator',
        fen: game.chess.fen(),
        status: game.status
      });
    }
    
    // Notify all clients in the room that someone joined
    io.to(matchId).emit('gameState', getGameState(matchId));
  });

  // Handle making a move
  socket.on('makeMove', ({ matchId, playerId, from, to, promotion }: MovePieceParams) => {
    console.log(`Move in game ${matchId} by player ${playerId}: ${from} to ${to}`);
    
    const game = games[matchId];
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    // Determine if the player is allowed to make this move
    let playerColor: PlayerColor | null = null;
    if (game.players.white === playerId) {
      playerColor = 'white';
    } else if (game.players.black === playerId) {
      playerColor = 'black';
    }
    
    if (!playerColor) {
      socket.emit('error', { message: 'Not a player in this game' });
      return;
    }
    
    // Convert our color to chess.js color format
    const chessColor = playerColorToChessColor(playerColor);
    
    // Check if it's the player's turn
    if (game.chess.turn() === chessColor) {
      try {
        // Attempt to make the move
        const move = game.chess.move({
          from: from as Square,
          to: to as Square,
          promotion: promotion as any || undefined
        });
        
        if (move) {
          // Move was successful, create game state update
          const gameState: GameStateUpdate = {
            matchId,
            fen: game.chess.fen(),
            turn: game.chess.turn(),
            lastMove: { from, to },
            isCheck: game.chess.isCheck(),
            isCheckmate: game.chess.isCheckmate(),
            isDraw: game.chess.isDraw(),
            isGameOver: game.chess.isGameOver(),
            status: game.status
          };
          
          // Update game status if game is over
          if (game.chess.isGameOver()) {
            game.status = 'complete';
            gameState.status = 'complete';
            
            if (game.chess.isCheckmate()) {
              // The winner is the player who just made the move
              const winner: PlayerColor = playerColor;
              game.winner = winner;
              gameState.winner = winner;
              gameState.result = `Checkmate - ${winner} wins`;
              game.result = `Checkmate - ${winner} wins`;
            } else if (game.chess.isDraw()) {
              game.winner = 'draw';
              gameState.winner = 'draw';
              
              if (game.chess.isStalemate()) {
                game.result = 'Draw by stalemate';
                gameState.result = 'Draw by stalemate';
              } else if (game.chess.isThreefoldRepetition()) {
                game.result = 'Draw by repetition';
                gameState.result = 'Draw by repetition';
              } else if (game.chess.isInsufficientMaterial()) {
                game.result = 'Draw by insufficient material';
                gameState.result = 'Draw by insufficient material';
              } else {
                game.result = 'Draw';
                gameState.result = 'Draw';
              }
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
  });

  // Handle resigning
  socket.on('resignGame', ({ matchId, playerId }: JoinGameParams) => {
    const game = games[matchId];
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    // Check if the player is in the game
    let playerColor: PlayerColor | null = null;
    if (game.players.white === playerId) {
      playerColor = 'white';
    } else if (game.players.black === playerId) {
      playerColor = 'black';
    }
    
    if (!playerColor) {
      socket.emit('error', { message: 'Not a player in this game' });
      return;
    }
    
    // Handle resignation
    game.status = 'complete';
    game.winner = playerColor === 'white' ? 'black' : 'white';
    game.result = `${playerColor} resigned`;
    
    // Send updated game state to all clients in the room
    io.to(matchId).emit('gameState', getGameState(matchId));
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Could handle cleanup here if needed
  });
});

// Helper function to get the current state of a game
function getGameState(matchId: string): GameStateUpdate {
  const game = games[matchId];
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  return {
    matchId,
    fen: game.chess.fen(),
    turn: game.chess.turn(),
    lastMove: game.chess.history({ verbose: true }).slice(-1)[0],
    isCheck: game.chess.isCheck(),
    isCheckmate: game.chess.isCheckmate(),
    isDraw: game.chess.isDraw(),
    isGameOver: game.chess.isGameOver(),
    status: game.status,
    winner: game.winner,
    result: game.result
  };
}

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Chess server listening on port ${PORT}`);
});

export default server;
