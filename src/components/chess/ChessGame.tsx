import React, { useState, useEffect, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';

interface ChessGameProps {
  matchId: string;
  opponentId?: string;
  isNewGame?: boolean;
}

interface GameState {
  fen: string;
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  status: 'waiting' | 'active' | 'complete';
  winner?: 'white' | 'black';
  result?: string;
  lastMove?: {
    from: string;
    to: string;
  };
}

const ChessGame: React.FC<ChessGameProps> = ({ matchId, opponentId, isNewGame = false }) => {
  const { user } = useUser();
  
  // Game state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chess, setChess] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'spectator'>('white');
  const [gameState, setGameState] = useState<GameState>({
    fen: chess.fen(),
    turn: chess.turn(),
    isCheck: chess.isCheck(),
    isCheckmate: chess.isCheckmate(),
    isDraw: chess.isDraw(),
    isGameOver: chess.isGameOver(),
    status: 'waiting'
  });
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Waiting for opponent...');

  // Initialize Socket connection
  useEffect(() => {
    const socketIo = io('http://localhost:8000');
    setSocket(socketIo);
    
    return () => {
      socketIo.disconnect();
    };
  }, []);

  // Create or join game when socket is available
  useEffect(() => {
    if (!socket || !user?.id) return;

    const playerId = user.id;
    
    // Set up socket event listeners
    socket.on('connect', () => {
      console.log('Connected to chess server');
      
      // Create new game or join existing game
      if (isNewGame) {
        socket.emit('createGame', { matchId, playerId });
      } else {
        socket.emit('joinGame', { matchId, playerId });
      }
    });

    // Game created event
    socket.on('gameCreated', (data) => {
      console.log('Game created:', data);
      setPlayerColor(data.color);
      setChess(new Chess(data.fen));
      setGameState((prev) => ({
        ...prev,
        fen: data.fen,
        status: data.status
      }));
      setStatusMessage(`Game created! You are playing as ${data.color}. Waiting for opponent...`);
    });

    // Game joined event
    socket.on('gameJoined', (data) => {
      console.log('Game joined:', data);
      setPlayerColor(data.color);
      setChess(new Chess(data.fen));
      setGameState((prev) => ({
        ...prev,
        fen: data.fen,
        status: data.status
      }));
      
      if (data.color === 'spectator') {
        setStatusMessage('You are spectating this game');
      } else {
        setStatusMessage(`You joined as ${data.color}. ${data.status === 'waiting' ? 'Waiting for opponent...' : ''}`);
      }
    });

    // Game started event
    socket.on('gameStarted', (data) => {
      console.log('Game started:', data);
      setChess(new Chess(data.fen));
      setGameState((prev) => ({
        ...prev,
        fen: data.fen,
        status: data.status,
        turn: data.turn
      }));
      setStatusMessage(`Game started! ${data.turn === 'w' ? 'White' : 'Black'}'s turn`);
    });

    // Move made event
    socket.on('moveMade', (data) => {
      console.log('Move made:', data);
      setChess(new Chess(data.fen));
      setGameState({
        fen: data.fen,
        turn: data.turn,
        isCheck: data.isCheck,
        isCheckmate: data.isCheckmate,
        isDraw: data.isDraw,
        isGameOver: data.isGameOver,
        status: data.status || gameState.status,
        winner: data.winner,
        result: data.result,
        lastMove: data.lastMove
      });

      // Update status message based on game state
      if (data.isGameOver) {
        if (data.isCheckmate) {
          const winner = data.winner === playerColor ? 'You won!' : 'You lost!';
          setStatusMessage(`Checkmate! ${winner}`);
        } else if (data.isDraw) {
          setStatusMessage('Game ended in a draw');
        } else {
          setStatusMessage('Game over');
        }
      } else if (data.isCheck) {
        setStatusMessage('Check!');
      } else {
        const turnColor = data.turn === 'w' ? 'White' : 'Black';
        const isMyTurn = 
          (playerColor === 'white' && data.turn === 'w') || 
          (playerColor === 'black' && data.turn === 'b');
        
        setStatusMessage(isMyTurn ? 'Your turn' : `${turnColor}'s turn`);
      }
    });

    // Game over event
    socket.on('gameOver', (data) => {
      console.log('Game over:', data);
      
      if (data.result === 'resignation') {
        const isWinner = data.winner === playerColor;
        setStatusMessage(isWinner 
          ? 'You won! Opponent resigned.' 
          : 'You resigned and lost the game.');
      }
      
      setGameState((prev) => ({
        ...prev,
        status: 'complete',
        winner: data.winner
      }));
    });

    // Error events
    socket.on('error', (data) => {
      console.error('Socket error:', data);
      setStatusMessage(`Error: ${data.message}`);
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('gameStarted');
      socket.off('moveMade');
      socket.off('gameOver');
      socket.off('error');
    };
  }, [socket, user, matchId, isNewGame, playerColor]);

  // Make move function
  const onSquareClick = useCallback(
    (square: string) => {
      if (!socket || playerColor === 'spectator' || gameState.status !== 'active') {
        return;
      }

      // Check if it's your turn
      const isMyTurn = 
        (playerColor === 'white' && chess.turn() === 'w') || 
        (playerColor === 'black' && chess.turn() === 'b');
        
      if (!isMyTurn) {
        setStatusMessage("It's not your turn");
        return;
      }

      // Try to make a move if a piece is already selected
      if (selectedSquare) {
        try {
          // Attempt the move locally to check if it's valid
          const moveResult = chess.move({
            from: selectedSquare,
            to: square,
            promotion: 'q' // Always promote to a queen for simplicity
          });
          
          // Undo the move in the local state (server will broadcast the real move)
          chess.undo();
          
          if (moveResult) {
            // Valid move, send to server
            socket.emit('makeMove', {
              matchId,
              playerId: user?.id,
              from: selectedSquare,
              to: square,
              promotion: moveResult.promotion || undefined
            });
            
            setSelectedSquare(null);
          } else {
            // If the clicked square has one of our pieces, select that instead
            const piece = chess.get(square as Square);
            const isOurPiece = piece && ((piece.color === 'w' && playerColor === 'white') || 
                                          (piece.color === 'b' && playerColor === 'black'));
                                          
            if (isOurPiece) {
              setSelectedSquare(square);
            } else {
              setSelectedSquare(null);
            }
          }
        } catch (error) {
          console.error("Invalid move:", error);
          setSelectedSquare(null);
        }
      } else {
        // Select the piece if it belongs to the player
        const piece = chess.get(square as Square);
        const isOurPiece = piece && ((piece.color === 'w' && playerColor === 'white') || 
                                      (piece.color === 'b' && playerColor === 'black'));
        
        if (isOurPiece) {
          setSelectedSquare(square);
        }
      }
    },
    [chess, selectedSquare, socket, matchId, user, playerColor, gameState.status]
  );

  // Resign game function
  const handleResign = () => {
    if (socket && user?.id && gameState.status === 'active') {
      socket.emit('resignGame', {
        matchId,
        playerId: user.id
      });
    }
  };

  // Get custom square styles for highlighting
  const getSquareStyles = () => {
    const styles: Record<string, React.CSSProperties> = {};
    
    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = { 
        backgroundColor: 'rgba(255, 255, 0, 0.4)' 
      };
      
      // Highlight possible moves
      try {
        // Cast selectedSquare to the Square type required by chess.js
        const moves = chess.moves({ 
          square: selectedSquare as Square, 
          verbose: true 
        }) as Array<{ to: string, from: string, [key: string]: any }>;
        
        // Add indicators for possible moves
        moves.forEach((move) => {
          styles[move.to] = {
            background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
            borderRadius: '50%'
          };
        });
      } catch (error) {
        console.error("Error getting moves:", error);
      }
    }
    
    // Highlight last move
    if (gameState.lastMove) {
      styles[gameState.lastMove.from] = { 
        backgroundColor: 'rgba(255, 153, 51, 0.4)'
      };
      styles[gameState.lastMove.to] = { 
        backgroundColor: 'rgba(255, 153, 51, 0.4)' 
      };
    }
    
    return styles;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Chess Game</CardTitle>
        <CardDescription>
          Game ID: {matchId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-center">
          <p className="text-lg font-medium">{statusMessage}</p>
          {gameState.isCheck && !gameState.isCheckmate && (
            <p className="text-red-500 font-bold">Check!</p>
          )}
        </div>

        <div className="border border-gray-200 rounded-md">
          <Chessboard
            position={gameState.fen}
            onSquareClick={onSquareClick}
            customSquareStyles={getSquareStyles()}
            boardOrientation={playerColor === 'black' ? 'black' : 'white'}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        {gameState.status === 'active' && playerColor !== 'spectator' && (
          <Button 
            variant="destructive" 
            onClick={handleResign}
            className="px-6"
          >
            Resign
          </Button>
        )}
        {gameState.status === 'complete' && (
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/chess'}
            className="px-6"
          >
            Back to Chess Lobby
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChessGame;
