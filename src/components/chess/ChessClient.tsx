import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { ChessGame } from '@/lib/chess/game';
import ChessBoard from './ChessBoard';

// The base chess client (no multiplayer)
export const ChessClient = Client({
  game: ChessGame,
  board: ChessBoard,
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
    board: ChessBoard,
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
