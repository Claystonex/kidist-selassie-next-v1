import React, { useState } from 'react';
import { BoardProps } from 'boardgame.io/react';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js';

type ChessPiece = {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
};

interface ChessBoardProps extends BoardProps {
  playerID: string;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  G, 
  ctx, 
  moves, 
  playerID,
  isActive 
}) => {
  const [squareStyles, setSquareStyles] = useState<Record<string, React.CSSProperties>>({});
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  
  // Create a chess instance to get game information
  const chess = new Chess(G.chess);
  
  // Determine the current player's color
  const myColor = G.playerColors[playerID];
  const isMyTurn = isActive && chess.turn() === myColor;
  
  // Handle square click for move selection
  const handleSquareClick = (square: string) => {
    if (!isMyTurn) return; // Not my turn
    
    // Get the piece on the clicked square
    const piece = chess.get(square) as ChessPiece | null;
    
    // If selected square is null and no piece or wrong color piece, do nothing
    if (!selectedSquare) {
      if (!piece || piece.color !== myColor) return;
      
      // Highlight clicked square
      setSelectedSquare(square);
      setSquareStyles({
        [square]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      });
      
      // Show possible moves
      const moves = chess.moves({ square, verbose: true });
      const newStyles: Record<string, React.CSSProperties> = { 
        [square]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } 
      };
      
      moves.forEach(move => {
        newStyles[move.to] = {
          background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
          borderRadius: '50%'
        };
      });
      
      setSquareStyles(newStyles);
    } else {
      // If there's already a selected square, try to move
      // If same square clicked, deselect
      if (square === selectedSquare) {
        setSelectedSquare(null);
        setSquareStyles({});
        return;
      }
      
      // Check if move is valid
      try {
        const moveData = {
          from: selectedSquare,
          to: square,
          promotion: 'q' // Auto-promote to queen for simplicity
        };
        
        // Verify the move is legal
        const validMove = chess.move(moveData);
        chess.undo(); // Undo the move verification
        
        if (validMove) {
          // Execute the move through boardgame.io
          moves.movePiece(selectedSquare, square, 
            // Handle pawn promotion
            validMove.flags.includes('p') ? 'q' : undefined
          );
          
          // Clear selection
          setSelectedSquare(null);
          setSquareStyles({});
        } else {
          // If target square contains own piece, select that instead
          const targetPiece = chess.get(square) as ChessPiece | null;
          if (targetPiece && targetPiece.color === myColor) {
            setSelectedSquare(square);
            setSquareStyles({
              [square]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
            });
          } else {
            setSelectedSquare(null);
            setSquareStyles({});
          }
        }
      } catch (e) {
        console.error('Invalid move', e);
        setSelectedSquare(null);
        setSquareStyles({});
      }
    }
  };

  const checkGameState = () => {
    if (chess.game_over()) {
      if (chess.in_checkmate()) {
        return 'Checkmate!';
      } else if (chess.in_stalemate()) {
        return 'Draw by stalemate';
      } else if (chess.in_threefold_repetition()) {
        return 'Draw by repetition';
      } else if (chess.insufficient_material()) {
        return 'Draw by insufficient material';
      } else {
        return 'Game over';
      }
    }
    
    if (chess.in_check()) {
      return 'Check!';
    }
    
    return null;
  };

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
        />
      </div>

      {isActive && !ctx.gameover && (
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          onClick={() => moves.resignGame()}
        >
          Resign
        </button>
      )}
    </div>
  );
};

export default ChessBoard;
