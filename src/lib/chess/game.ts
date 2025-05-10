import { INVALID_MOVE, TurnOrder } from 'boardgame.io/core';
import { Chess, Square } from 'chess.js';

// Define types for our game state
// Use explicit literal types for playerColors to ensure type safety
type ChessPlayerColor = 'w' | 'b';
type PlayerId = '0' | '1';

interface ChessGameState {
  chess: string;
  isPlayer0White: boolean;
  playerColors: {
    [key in PlayerId]: ChessPlayerColor;
  };
  winner?: ChessPlayerColor;
  history: Array<{
    from: string;
    to: string;
    promotion?: string;
    piece: string;
    color: string;
  }>;
}

// Define context types for our game functions
interface GameContext {
  G: ChessGameState;
  ctx: any; // Using any for ctx since we can't import Ctx directly
  playerID?: string;
}

// Define return types for game end conditions
type GameOverResult = 
  | { winner: string; message?: string; draw?: never } 
  | { draw: boolean; message: string; winner?: never } 
  | undefined;


// Game definition using boardgame.io v0.50.2 format
// Note: Due to TypeScript limitations, we're using type assertions in places
// where boardgame.io's types don't perfectly align with our code
export const ChessGame = {
  // Name of the game
  name: 'kidist-selassie-chess',
  
  // Initial game state - updated for v0.50.2
  setup: ({ ctx }: { ctx: any }) => {
    // Randomly assign colors - player 0 or 1 gets white
    const isPlayer0White = Math.random() < 0.5;
    
    // Create a properly typed state object
    return {
      chess: new Chess().fen(),
      isPlayer0White,
      playerColors: {
        '0': isPlayer0White ? 'w' : 'b',
        '1': isPlayer0White ? 'b' : 'w',
      } as { [key in PlayerId]: ChessPlayerColor },
      history: []
    };
  },
  
  // Available moves - updated for v0.50.2
  moves: {
    // Handle a piece movement
    movePiece: ({ G, ctx, playerID }: GameContext, from: string, to: string, promotion?: string) => {
      const chess = new Chess(G.chess);
      const currentTurn = chess.turn();
      
      // Type assertion for ctx.currentPlayer
      const currentPlayer = ctx.currentPlayer as PlayerId;
      const playerColor = G.playerColors[currentPlayer];
      
      // Only allow moves for the player's assigned color
      if (currentTurn !== playerColor) {
        return G;
      }
      
      try {
        const move = chess.move({ 
          from: from as Square, 
          to: to as Square, 
          promotion: promotion || undefined 
        });
        
        if (move) {
          return { 
            ...G, 
            chess: chess.fen(),
            history: [...G.history, {
              from, 
              to, 
              promotion,
              piece: move.piece,
              color: move.color
            }]
          };
        }
      } catch (e) {
        // Invalid move
        console.error("Invalid move", e);
      }
      
      return G;
    },
    
    // Forfeit the game
    resignGame: ({ G, ctx }: GameContext) => {
      // Type assertion for ctx.currentPlayer
      const currentPlayer = ctx.currentPlayer as PlayerId;
      
      // Make sure we return a value of the correct type
      const winner = G.playerColors[currentPlayer] === 'w' ? 'b' : 'w' as ChessPlayerColor;
      
      return {
        ...G,
        winner
      };
    }
  },
  
  // Turn management - updated for v0.50.2
  turn: {
    order: TurnOrder.DEFAULT,
    minMoves: 1,
    maxMoves: 1,
  },
  
  // Game end conditions - updated for v0.50.2
  endIf: ({ G, ctx }: GameContext): GameOverResult => {
    // Check for manual resignation
    if (G.winner) {
      // Convert chess color (w/b) to player ID (0/1)
      const winningPlayerID = G.winner === 'w' 
        ? (G.isPlayer0White ? '0' : '1') 
        : (G.isPlayer0White ? '1' : '0');
      
      return { winner: winningPlayerID };
    }
    
    // Check for game end conditions from chess.js
    const chess = new Chess(G.chess);
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        // The player who just moved won - get chess color (w/b)
        const winnerColor = chess.turn() === 'w' ? 'b' : 'w' as ChessPlayerColor;
        
        // Convert to player ID
        const winningPlayerID = winnerColor === 'w' 
            ? (G.isPlayer0White ? '0' : '1') 
            : (G.isPlayer0White ? '1' : '0');
            
        return { 
          winner: winningPlayerID,
          message: 'Checkmate!'
        };
      } else if (chess.isStalemate()) {
        return { draw: true, message: 'Draw by stalemate' };
      } else if (chess.isThreefoldRepetition()) {
        return { draw: true, message: 'Draw by repetition' };
      } else if (chess.isInsufficientMaterial()) {
        return { draw: true, message: 'Draw by insufficient material' };
      } else if (chess.isDraw()) {
        return { draw: true, message: 'Draw' };
      }
    }
  },
  
  // Phases for game setup and play
  phases: {
    play: {
      start: true,
    }
  }
};
