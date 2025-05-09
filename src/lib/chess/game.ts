import { Game, TurnOrder } from 'boardgame.io/core';
import { Chess } from 'chess.js';

// Game definition using boardgame.io
export const ChessGame = Game({
  name: 'kidist-selassie-chess',
  
  // Initial game state
  setup: (ctx) => {
    // Randomly assign colors - player 0 or 1 gets white
    const isPlayer0White = Math.random() < 0.5;
    
    return {
      chess: new Chess().fen(),
      isPlayer0White: isPlayer0White,
      playerColors: {
        '0': isPlayer0White ? 'w' : 'b',
        '1': isPlayer0White ? 'b' : 'w',
      }
    };
  },
  
  // Available moves
  moves: {
    // Handle a piece movement
    movePiece: (G, ctx, from, to, promotion) => {
      const chess = new Chess(G.chess);
      const currentTurn = chess.turn();
      const playerColor = G.playerColors[ctx.currentPlayer];
      
      // Only allow moves for the player's assigned color
      if (currentTurn !== playerColor) {
        return G;
      }
      
      try {
        const move = chess.move({ 
          from, 
          to, 
          promotion: promotion || undefined 
        });
        
        if (move) {
          return { ...G, chess: chess.fen() };
        }
      } catch (e) {
        // Invalid move
        console.error("Invalid move", e);
      }
      
      return G;
    },
    
    // Forfeit the game
    resignGame: (G, ctx) => {
      return {
        ...G,
        winner: G.playerColors[ctx.currentPlayer] === 'w' ? 'b' : 'w'
      };
    }
  },
  
  // Turn management
  turn: {
    order: TurnOrder.DEFAULT,
    minMoves: 1,
    maxMoves: 1,
  },
  
  // Game end conditions
  endIf: (G, ctx) => {
    // Check for manual resignation
    if (G.winner) {
      return { winner: G.winner === 'w' 
        ? (G.isPlayer0White ? '0' : '1') 
        : (G.isPlayer0White ? '1' : '0') 
      };
    }
    
    // Check for game end conditions from chess.js
    const chess = new Chess(G.chess);
    if (chess.game_over()) {
      if (chess.in_checkmate()) {
        // The player who just moved won
        const winner = chess.turn() === 'w' ? 'b' : 'w';
        return { 
          winner: winner === 'w' 
            ? (G.isPlayer0White ? '0' : '1') 
            : (G.isPlayer0White ? '1' : '0'),
          message: 'Checkmate!'
        };
      } else if (chess.in_stalemate()) {
        return { draw: true, message: 'Draw by stalemate' };
      } else if (chess.in_threefold_repetition()) {
        return { draw: true, message: 'Draw by repetition' };
      } else if (chess.insufficient_material()) {
        return { draw: true, message: 'Draw by insufficient material' };
      } else if (chess.in_draw()) {
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
});
