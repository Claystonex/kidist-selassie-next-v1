'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ChessGameProps {
  gameId: string;
  asSpectator?: boolean;
}

export default function SimpleChessGame({ gameId, asSpectator = false }: ChessGameProps) {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [game, setGame] = useState(new Chess());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | undefined>(undefined);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  
  // Connect to Socket.io server when component mounts
  useEffect(() => {
    if (!user?.id) return;
    
    // Initiate connection to Socket.io server
    async function initSocket() {
      setIsConnecting(true);
      
      try {
        // First ping the API endpoint to initialize the socket server
        await fetch('/api/socket');
        
        // Then connect to the socket
        const socketIo = io({
          path: '/api/socket',
        });
        
        socketIo.on('connect', () => {
          console.log('Connected to socket server');
          setIsConnecting(false);
          
          // Make sure user is still defined
          if (!user?.id) return;
          
          // Join the game
          if (asSpectator) {
            socketIo.emit('joinGame', { 
              gameId, 
              playerId: user.id,
              asSpectator: true 
            });
          } else {
            socketIo.emit('joinGame', { 
              gameId, 
              playerId: user.id,
              asSpectator: false 
            });
          }
        });
        
        socketIo.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          toast({
            title: 'Connection Error',
            description: 'Failed to connect to game server',
            variant: 'destructive'
          });
          setIsConnecting(false);
        });
        
        // Handle game state updates
        socketIo.on('gameState', (state) => {
          console.log('Game state update:', state);
          setGameState(state);
          
          // Update chess.js instance with FEN
          try {
            const newGame = new Chess();
            if (state.fen) {
              newGame.load(state.fen);
              setGame(newGame);
            }
          } catch (err) {
            console.error('Error loading FEN:', err);
          }
          
          // Determine player color
          if (!asSpectator && user?.id) {
            console.log('Checking player color:', { 
              userId: user.id, 
              whitePlayer: state.players?.white,
              blackPlayer: state.players?.black 
            });
            
            if (state.players?.white === user.id) {
              console.log('Setting player color to white');
              setPlayerColor('white');
            } else if (state.players?.black === user.id) {
              console.log('Setting player color to black');
              setPlayerColor('black');
            } else {
              console.log('User is not assigned a color yet');
            }
          }
        });
        
        // Handle moves made by opponent
        socketIo.on('moveMade', (moveData) => {
          setLastMove(moveData);
        });
        
        // Handle game over
        socketIo.on('gameOver', (result) => {
          let message = 'Game over: ';
          
          if (result.reason === 'checkmate') {
            message += `Checkmate! ${result.winner === user?.id ? 'You won!' : 'You lost.'}`;
          } else if (result.reason === 'stalemate') {
            message += 'Stalemate! The game is a draw.';
          } else if (result.reason === 'draw') {
            message += 'The game ended in a draw.';
          } else if (result.reason === 'resignation') {
            message += `${result.winner === user?.id ? 'Your opponent resigned! You won!' : 'You resigned.'}`;
          }
          
          toast({
            title: 'Game Over',
            description: message
          });
        });
        
        // Handle errors
        socketIo.on('error', (err) => {
          toast({
            title: 'Error',
            description: err.message,
            variant: 'destructive'
          });
        });
        
        setSocket(socketIo);
        
        // Cleanup on unmount
        return () => {
          socketIo.disconnect();
        };
      } catch (err) {
        console.error('Failed to initialize socket:', err);
        setIsConnecting(false);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to game server',
          variant: 'destructive'
        });
      }
    }
    
    initSocket();
  }, [user?.id, gameId, asSpectator, toast]);
  
  // Handle making a move
  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (!socket || !playerColor || asSpectator || !user?.id) return false;
    
    // Only allow moves if it's the player's turn
    const turn = game.turn();
    const isPlayerTurn = (playerColor === 'white' && turn === 'w') || 
                         (playerColor === 'black' && turn === 'b');
    
    if (!isPlayerTurn) {
      toast({
        title: 'Not Your Turn',
        description: 'Wait for your opponent to move',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      // Try to make the move in local game instance
      const moveResult = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Default to queen promotion
      });
      
      // If move is invalid
      if (moveResult === null) return false;
      
      // Send move to server
      socket.emit('makeMove', {
        gameId,
        playerId: user.id,
        move: {
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q', // Default promotion
          fen: game.fen(),
          isCheck: game.isCheck(),
          isCheckmate: game.isCheckmate(),
          isDraw: game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()
        }
      });
      
      return true;
    } catch (err) {
      console.error('Error making move:', err);
      return false;
    }
  }, [game, socket, playerColor, gameId, asSpectator, user?.id, toast]);
  
  // Handle resignation
  const handleResign = useCallback(() => {
    if (!socket || asSpectator || !user?.id) return;
    
    if (window.confirm('Are you sure you want to resign?')) {
      socket.emit('resign', {
        gameId,
        playerId: user.id
      });
    }
  }, [socket, gameId, user, asSpectator]);
  
  // Go back to the chess lobby
  const handleBackToLobby = useCallback(() => {
    router.push('/chess');
  }, [router]);
  
  // Loading state
  if (isConnecting) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p>Connecting to game server...</p>
      </div>
    );
  }
  
  // Waiting for opponent
  if (gameState?.status === 'waiting' && !asSpectator) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Waiting for Opponent</CardTitle>
          <CardDescription>Share this game ID with your opponent: {gameId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Waiting for your opponent to join the game...</p>
          <Button onClick={handleBackToLobby}>Back to Lobby</Button>
        </CardContent>
      </Card>
    );
  }
  
  // Game board
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {asSpectator 
              ? 'Spectating Chess Game' 
              : `Playing as ${playerColor || 'unknown'}`}
          </CardTitle>
          <CardDescription>
            Game ID: {gameId} | Status: {gameState?.status || 'unknown'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full max-w-md mx-auto">
            <Chessboard
              id={gameId}
              position={game.fen()}
              onPieceDrop={onDrop}
              boardOrientation={playerColor || 'white'}
              customBoardStyle={{
                borderRadius: '4px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
              }}
              customSquareStyles={{
                ...(lastMove ? {
                  [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
                  [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
                } : {})
              }}
            />
          </div>
          
          <div className="flex justify-between">
            <Button onClick={handleBackToLobby} variant="outline">
              Back to Lobby
            </Button>
            
            {!asSpectator && (
              <Button onClick={handleResign} variant="destructive">
                Resign
              </Button>
            )}
          </div>
          
          <div className="mt-4 p-2 bg-muted rounded-md">
            <p>
              {game.turn() === 'w' ? 'White' : 'Black'} to move
              {game.isCheck() ? ' (Check)' : ''}
            </p>
            {game.isCheckmate() && <p className="text-red-500 font-bold">Checkmate!</p>}
            {game.isDraw() && <p className="text-yellow-500 font-bold">Draw!</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
