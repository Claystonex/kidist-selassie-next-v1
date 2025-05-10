import React from 'react';
import { Client, BoardProps } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { ChessGame as ChessGameDefinition } from '@/lib/chess/game';
import ChessBoard from './ChessBoard';

// Use our game definition to create a boardgame.io compatible game
const ChessGame = {
  ...ChessGameDefinition,
};

// Adapter component to bridge the type gap between boardgame.io and our ChessBoard
const ChessBoardAdapter = (props: BoardProps) => {
  // We need to adapt the boardgame.io props to match our ChessBoard component's expectations
  return <ChessBoard 
    G={props.G as any} // Use type assertion to bridge the gap
    ctx={{
      // Provide the properties our GameContext interface expects
      currentPlayer: props.ctx.currentPlayer,
      turn: props.ctx.turn,
      playOrder: props.ctx.playOrder,
      playOrderPos: props.ctx.playOrderPos,
      numPlayers: props.ctx.numPlayers,
      phase: props.ctx.phase,
      activePlayers: props.ctx.activePlayers as any,
      gameover: props.ctx.gameover
    }}
    moves={{
      // Ensure required methods are available
      movePiece: (from, to, promotion) => {
        // Type safety for move actions
        if (props.moves.makeMove) {
          props.moves.makeMove({from, to, promotion});
        }
      },
      resignGame: () => {
        if (props.moves.resign) {
          props.moves.resign();
        }
      },
      // Add other optional moves if needed
      ...props.moves as any
    }}
    playerID={props.playerID || ''} // Ensure playerID is never null
    isActive={props.isActive}
  />;
};

// The base chess client (no multiplayer)
export const ChessClient = Client({
  game: ChessGame,
  board: ChessBoardAdapter, // Use our adapter instead of ChessBoard directly
  debug: process.env.NODE_ENV === 'development',
});

// Multiplayer chess client with socket connection
export const MultiplayerChessClient = (props: { 
  matchID: string; 
  playerID: string;
  credentials: string;
}) => {
  const { matchID, playerID, credentials } = props;
  
  // Create client component with socket multiplayer
  const ChessClientComponent = Client({
    game: ChessGame,
    board: ChessBoardAdapter, // Use our adapter instead of ChessBoard directly
    debug: process.env.NODE_ENV === 'development',
    multiplayer: SocketIO({ 
      server: typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.hostname}:8000` 
        : 'http://localhost:8000'
    }),
  });

  return (
    <ChessClientComponent
      matchID={matchID}
      playerID={playerID}
      credentials={credentials}
    />
  );
};
