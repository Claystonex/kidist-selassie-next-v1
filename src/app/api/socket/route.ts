import { NextRequest, NextResponse } from 'next/server';
import { Server, Socket } from 'socket.io';

// Define TypeScript interfaces for our game state
interface ChessGamePlayers {
  white: string | null;
  black: string | null;
}

interface ChessGameState {
  players: ChessGamePlayers;
  spectators: string[];
  fen: string;
  status: 'waiting' | 'active' | 'complete';
  turn: 'w' | 'b';
  winner?: 'w' | 'b' | null;
  lastMove?: {
    from: string;
    to: string;
    promotion?: string;
  };
}

interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
  fen: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
}

// Store active games
const games = new Map<string, ChessGameState>();

// Debug helper to log the current state of a game
function logGameState(gameId: string, message: string) {
  const game = games.get(gameId);
  console.log(`[DEBUG] ${message}`);
  console.log(`[DEBUG] Game ${gameId} state:`, {
    status: game?.status,
    whitePlayer: game?.players.white,
    blackPlayer: game?.players.black,
    spectators: game?.spectators?.length,
    turn: game?.turn,
    fen: game?.fen?.substring(0, 30) + '...' // Log just the start of the FEN string
  });
}

// Store connected sockets
let io: Server;

export async function GET(req: NextRequest) {
  if (!io) {
    // This code will only run once when first client connects
    console.log('Initializing Socket.io server');
    
    // @ts-ignore - NextJs doesn't have proper types for this
    const res = NextResponse.next();
    // @ts-ignore
    const server = res.socket.server;
    
    if (!server.io) {
      console.log('Creating new Socket.io server instance');
      server.io = new Server(server, {
        path: '/api/socket',
        addTrailingSlash: false,
      });
      
      // Save the io instance to our module variable
      io = server.io;
      
      // Set up socket event handlers
      io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);
        
        // Log information about the connection
        const transport = socket.conn.transport?.name || 'unknown';
        console.log(`Socket connected with transport: ${transport}`);
        console.log(`Socket query params:`, socket.handshake.query);
        
        // Send a welcome message to confirm connection
        socket.emit('connected', { message: 'Successfully connected to chess server' });
        
        // Handle creating a new game
        socket.on('createGame', ({ gameId, playerId }: { gameId: string; playerId: string }) => {
          console.log(`Creating game ${gameId} by player ${playerId}`);
          
          if (!games.has(gameId)) {
            // Initialize new game with Chess.js
            games.set(gameId, {
              players: {
                white: playerId,
                black: null
              },
              spectators: [],
              fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Initial position
              status: 'waiting',
              turn: 'w'
            });
            
            // Join the game room
            socket.join(gameId);
            
            // Emit game state to creator
            io.to(gameId).emit('gameState', games.get(gameId));
          } else {
            socket.emit('error', { message: 'Game already exists' });
          }
        });
        
        // Handle joining a game
        socket.on('joinGame', ({ gameId, playerId, asSpectator }: { gameId: string; playerId: string; asSpectator?: boolean }) => {
          console.log(`Player ${playerId} joining game ${gameId}${asSpectator ? ' as spectator' : ''}`);
          
          const game = games.get(gameId);
          
          if (!game) {
            console.log(`[ERROR] Game ${gameId} not found when ${playerId} tried to join`);
            socket.emit('error', { message: 'Game not found' });
            return;
          }
          
          // Log all current games for debugging
          console.log(`[DEBUG] Current games:`, Array.from(games.keys()));
          
          socket.join(gameId);
          
          if (asSpectator) {
            if (!game.spectators.includes(playerId)) {
              game.spectators.push(playerId);
            }
          } else {
            // Join as black player if slot is available
            if (game.players.black === null) {
              game.players.black = playerId;
              game.status = 'active'; // Game can start now
            } else if (game.players.white === null) {
              game.players.white = playerId;
              game.status = 'active'; // Game can start now
            } else {
              socket.emit('error', { message: 'Game is full' });
              return;
            }
          }
          
          // Broadcast updated game state
          io.to(gameId).emit('gameState', game);
        });
        
        // Handle making a move
        socket.on('makeMove', ({ gameId, playerId, move }: { gameId: string; playerId: string; move: ChessMove }) => {
          console.log(`Move in game ${gameId} by ${playerId}: ${move.from} to ${move.to}`);
          
          const game = games.get(gameId);
          
          if (!game) {
            console.log(`[ERROR] Game ${gameId} not found when ${playerId} tried to make move ${move.from}-${move.to}`);
            socket.emit('error', { message: 'Game not found' });
            return;
          }
          
          // Log the current game state before the move
          logGameState(gameId, `Before move ${move.from}-${move.to} by ${playerId}`);
          
          // Check if it's player's turn
          const playerColor = game.players.white === playerId ? 'w' : 'b';
          
          if (playerColor !== game.turn) {
            socket.emit('error', { message: 'Not your turn' });
            return;
          }
          
          // Update game state (this will be validated on the client with chess.js)
          game.fen = move.fen;
          game.turn = game.turn === 'w' ? 'b' : 'w';
          game.lastMove = {
            from: move.from,
            to: move.to,
            promotion: move.promotion
          };
          
          // Check for game end conditions (from move data sent by client)
          if (move.isCheckmate) {
            game.status = 'complete';
            game.winner = playerColor;
            
            io.to(gameId).emit('gameOver', {
              reason: 'checkmate',
              winner: playerColor === 'w' ? game.players.white : game.players.black
            });
          } else if (move.isDraw) {
            game.status = 'complete';
            game.winner = null;
            
            io.to(gameId).emit('gameOver', {
              reason: 'draw',
              winner: null
            });
          }
          
          // Broadcast updated state to all players
          io.to(gameId).emit('gameState', game);
          io.to(gameId).emit('moveMade', {
            from: move.from,
            to: move.to,
            promotion: move.promotion
          });
          
          // Log the game state after the move
          logGameState(gameId, `After move ${move.from}-${move.to} by ${playerId}`);
        });
        
        // Handle game resignation
        socket.on('resign', ({ gameId, playerId }: { gameId: string; playerId: string }) => {
          console.log(`Player ${playerId} resigned from game ${gameId}`);
          
          const game = games.get(gameId);
          
          if (!game) {
            console.log(`[ERROR] Game ${gameId} not found when ${playerId} tried to resign`);
            socket.emit('error', { message: 'Game not found' });
            return;
          }
          
          // Log the game state before resignation
          logGameState(gameId, `Before resignation by ${playerId}`);
          
          if (game.status !== 'active') {
            socket.emit('error', { message: 'Game is not active' });
            return;
          }
          
          if (game.players.white !== playerId && game.players.black !== playerId) {
            socket.emit('error', { message: 'You are not a player in this game' });
            return;
          }
          
          game.status = 'complete';
          
          // The other player wins
          const winner = game.players.white === playerId 
            ? game.players.black 
            : game.players.white;
            
          game.winner = game.players.white === playerId ? 'b' : 'w';
          
          io.to(gameId).emit('gameOver', {
            reason: 'resignation',
            winner
          });
          
          // Broadcast updated game state
          io.to(gameId).emit('gameState', game);
        });
        
        // Handle disconnection
        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
          
          // Check if this player was in any games and mark them as potentially disconnected
          // This would be a good place to add auto-forfeit after a timeout
          for (const [gameId, game] of games.entries()) {
            if (game.players.white === socket.id || game.players.black === socket.id) {
              console.log(`Player ${socket.id} disconnected from game ${gameId}`);
              // You could add disconnection handling here if needed
            }
          }
        });
        
        // Add a ping handler to help diagnose connection issues
        socket.on('ping', (callback) => {
          if (typeof callback === 'function') {
            callback({ time: Date.now(), message: 'pong' });
          }
        });
      });
    } else {
      console.log('Reusing existing Socket.io server instance');
      io = server.io;
    }
  }
  
  return new NextResponse('Socket.io server is running', {
    status: 200,
  });
}
