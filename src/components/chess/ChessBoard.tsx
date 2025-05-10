import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BoardProps } from 'boardgame.io/react';
import Chessboard from 'chessboardjsx';
import { Chess, Square } from 'chess.js';

type ChessPiece = {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
};

type ChessMoveSan = {
  from: string;
  to: string;
  flags: string;
  piece: string;
  san: string;
  promotion?: string;
};

interface MoveHistory {
  from: string;
  to: string;
  promotion?: string;
  piece: string;
  color: 'w' | 'b';
}

interface GameState {
  chess: string; // FEN notation
  playerColors: Record<string, 'w' | 'b'>;
  history: MoveHistory[];
}

// Context matching boardgame.io's Ctx interface
interface GameContext {
  currentPlayer: string;
  turn: number;
  playOrder: string[];
  playOrderPos: number;
  numPlayers: number;
  phase?: string;
  activePlayers?: Record<string, unknown>;
  gameover?: {
    winner?: string;
    draw?: boolean;
    message?: string;
  };
}

interface GameMoves {
  movePiece: (from: string, to: string, promotion?: string) => void;
  resignGame: () => void;
  offerDraw?: () => void;
  acceptDraw?: () => void;
  declineDraw?: () => void;
}

// Props interface for the ChessBoard component
interface ChessBoardProps {
  G: GameState;
  ctx: GameContext;
  moves: GameMoves;
  playerID: string;
  isActive: boolean;
  isConnected?: boolean;
  log?: any[];
}

/**
 * ChessBoard Component
 * Renders a chess board UI that integrates with boardgame.io for multiplayer support
 */
const ChessBoard: React.FC<ChessBoardProps> = ({ 
  G, 
  ctx, 
  moves, 
  playerID,
  isActive 
}) => {
  // Component state
  const [squareStyles, setSquareStyles] = useState<Record<string, React.CSSProperties>>({});
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  
  // Create a chess instance to get game information
  const chess = useMemo(() => {
    try {
      if (!G.chess) {
        console.error('Invalid chess state');
        return new Chess();
      }
      return new Chess(G.chess);
    } catch (error) {
      console.error('Error initializing chess board:', error);
      return new Chess();
    }
  }, [G.chess]);
  
  // Listen for board changes to update game state display
  useEffect(() => {
    const gameStateResult = checkGameState();
    if (gameStateResult) {
      console.debug(`Game state updated: ${gameStateResult}`);
    }
  }, [G.chess]); 
  
  // Determine player color and turn status
  const myColor = G.playerColors?.[playerID] || 'w';
  const isMyTurn = isActive && chess.turn() === myColor;
  
  // Handle highlighting legal moves when a square is selected
  const highlightLegalMoves = useCallback((square: string) => {
    // Convert string square to chess.js Square type
    const chessSquare = square as Square;
    const piece = chess.get(chessSquare) as ChessPiece | null;
    if (!piece || piece.color !== myColor) return null;
    
    // Prepare styles for highlighting the selected square and legal moves
    const newStyles: Record<string, React.CSSProperties> = {
      [square]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    };
    
    try {
      // Add indicators for all legal moves from this square
      const legalMoves = chess.moves({ square: chessSquare, verbose: true }) as any[];
      legalMoves.forEach(move => {
        newStyles[move.to] = {
          background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
          borderRadius: '50%'
        };
      });
      return newStyles;
    } catch (err) {
      console.error('Error getting legal moves:', err);
      return { [square]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } };
    }
  }, [chess, myColor]);
  
  // Handle square click for move selection
  const handleSquareClick = useCallback((square: string) => {
    // Convert string square to chess.js Square type
    const chessSquare = square as Square;
    if (!isMyTurn) return; // Not my turn
    
    try {
      // If no square is currently selected
      if (!selectedSquare) {
        const piece = chess.get(chessSquare) as ChessPiece | null;
        
        // Verify the clicked square has one of our pieces
        if (!piece || piece.color !== myColor) {
          console.debug('Invalid selection: empty square or opponent piece');
          return;
        }
        
        // Select the square and highlight legal moves
        setSelectedSquare(square);
        const newStyles = highlightLegalMoves(square);
        if (newStyles) setSquareStyles(newStyles);
      } else {
        // A square is already selected, so this click is a potential move target
        
        // If user clicks the same square again, deselect it
        if (square === selectedSquare) {
          setSelectedSquare(null);
          setSquareStyles({});
          return;
        }
        
        // Try to make a move from selected square to target square
        const moveData = {
          from: selectedSquare,
          to: square,
          promotion: 'q' // Auto-promote to queen for simplicity
        };
        
        // Validate the move without changing the main chess instance
        let isLegalMove = false;
        let needsPromotion = false;
        
        try {
          // Create a temporary chess instance for validation
          const tempChess = new Chess(G.chess);
          const validMove = tempChess.move(moveData) as ChessMoveSan | null;
          
          if (validMove) {
            isLegalMove = true;
            // Check if this is a pawn promotion
            needsPromotion = (
              validMove.piece === 'p' && 
              (validMove.to.charAt(1) === '8' || validMove.to.charAt(1) === '1')
            );
          }
        } catch (err) {
          console.error('Error validating move:', err);
        }
        
        if (isLegalMove) {
          // Execute the valid move through boardgame.io
          if (moves && typeof moves.movePiece === 'function') {
            moves.movePiece(
              selectedSquare,
              square,
              needsPromotion ? 'q' : undefined
            );
            
            // Clear selection after move
            setSelectedSquare(null);
            setSquareStyles({});
          } else {
            console.error('moves.movePiece is not a function');
            setSelectedSquare(null);
            setSquareStyles({});
          }
        } else {
          // Check if the clicked square contains one of our pieces
          const targetPiece = chess.get(chessSquare) as ChessPiece | null;
          
          if (targetPiece && targetPiece.color === myColor) {
            // Select this piece instead
            setSelectedSquare(square);
            const newStyles = highlightLegalMoves(square);
            if (newStyles) setSquareStyles(newStyles);
          } else {
            // Invalid move and not one of our pieces
            setSelectedSquare(null);
            setSquareStyles({});
          }
        }
      }
    } catch (error) {
      console.error('Error handling square click:', error);
      setSelectedSquare(null);
      setSquareStyles({});
    }
  }, [isMyTurn, chess, selectedSquare, moves, myColor, G.chess, highlightLegalMoves]);

  // Check the current state of the game (checkmate, draw, etc.)
  const checkGameState = useCallback((): string | null => {
    try {
      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          return 'Checkmate!';
        } else if (chess.isStalemate()) {
          return 'Draw by stalemate';
        } else if (chess.isThreefoldRepetition()) {
          return 'Draw by repetition';
        } else if (chess.isInsufficientMaterial()) {
          return 'Draw by insufficient material';
        } else {
          return 'Game over';
        }
      }
      
      if (chess.inCheck()) {
        return 'Check!';
      }
      
      return null;
    } catch (error) {
      console.error('Error checking game state:', error);
      return null;
    }
  }, [chess]);

  const gameState = checkGameState();
  const turnColor = chess.turn() === 'w' ? 'White' : 'Black';
  const myColorName = myColor === 'w' ? 'White' : 'Black';

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold">
          {ctx.gameover ? (
            <div className="text-xl">
              {ctx.gameover.winner === playerID 
                ? 'You won!' 
                : ctx.gameover.draw 
                  ? 'Draw!' 
                  : 'You lost!'}
              {ctx.gameover.message && <div>{ctx.gameover.message}</div>}
            </div>
          ) : (
            <div>
              <div>You are playing as {myColorName}</div>
              <div>
                {isMyTurn 
                  ? "Your turn" 
                  : `Waiting for opponent (${turnColor}'s turn)`}
              </div>
              {gameState && <div className="mt-2 text-red-500">{gameState}</div>}
            </div>
          )}
        </h2>
      </div>

      <div className="border border-gray-300 rounded-md">
        <Chessboard
          position={G.chess}
          width={400}
          orientation={myColor === 'w' ? 'white' : 'black'}
          squareStyles={squareStyles}
          onSquareClick={handleSquareClick}
          draggable={false}
          boardStyle={{
            borderRadius: '5px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
          }}
          lightSquareStyle={{ backgroundColor: '#f0d9b5' }}
          darkSquareStyle={{ backgroundColor: '#b58863' }}
        />
      </div>

      {/* Game control buttons */}
      {isActive && !ctx.gameover && (
        <div className="mt-4 flex gap-2">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={() => {
              if (moves && typeof moves.resignGame === 'function') {
                if (window.confirm('Are you sure you want to resign?')) {
                  moves.resignGame();
                }
              } else {
                console.error('moves.resignGame is not a function');
              }
            }}
          >
            Resign
          </button>
          
          {moves.offerDraw && (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={() => {
                if (moves && typeof moves.offerDraw === 'function') {
                  moves.offerDraw();
                }
              }}
            >
              Offer Draw
            </button>
          )}
        </div>
      )}
      
      {/* Display move history if available */}
      {G.history && G.history.length > 0 && (
        <div className="mt-4 border border-gray-300 rounded p-2 max-h-40 overflow-y-auto w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">Move History</h3>
          <div className="grid grid-cols-2 gap-1">
            {G.history.map((move, index) => (
              <div key={index} className="text-sm">
                {index % 2 === 0 ? Math.floor(index/2) + 1 + '.' : ''} 
                {move.piece.toUpperCase()}{move.from}-{move.to}
                {move.promotion ? `=${move.promotion.toUpperCase()}` : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
