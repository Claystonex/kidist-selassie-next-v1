/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import TranslatableText from '@/app/_components/TranslatableText';
import styles from '@/styles/ChessGame.module.css';

// Using module augmentation for chess.js type definitions
import { Chess } from 'chess.js';

// Augment the module definition instead of redeclaring
declare module 'chess.js' {
  interface ChessInstance {
    fen(): string;
    move(move: string | { from: string; to: string; promotion?: string }): any;
    isCheckmate(): boolean;
    isDraw(): boolean;
    isCheck(): boolean;
    turn(): string;
    reset(): void;
  }
  export interface Chess extends ChessInstance {}
} 

export default function ChessGamePage() {
  const game = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(game.fen());
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState('');

  const updateStatus = useCallback(() => {
    let moveColor = 'White';
    if (game.turn() === 'b') {
      moveColor = 'Black';
    }

    if (game.isCheckmate()) {
      setStatus(`Game over, ${moveColor} is in checkmate.`);
      setGameOver(true);
    } else if (game.isDraw()) {
      setStatus('Game over, drawn position.');
      setGameOver(true);
    } else {
      setStatus(moveColor + ' to move.');
      if (game.isCheck()) {
        setStatus((prev) => prev + ' ' + moveColor + ' is in check.');
      }
    }
  }, [game]);

  // Initial status update
  useMemo(updateStatus, [updateStatus]);

  function makeAMove(move: string | { from: string; to: string; promotion?: string }) {
    try {
      const result = game.move(move);
      if (result) {
        setFen(game.fen());
        updateStatus();
        return true;
      }
    } catch (e) {
      // Ignore invalid move attempts
      console.log('Invalid move:', move, e);
    }
    return false;
  }

  function onDrop(sourceSquare: string, targetSquare: string, piece: string) {
    if (gameOver) return false;

    // Check for promotion
    let promotion = undefined;
    // Simplified promotion check - needs to know piece type and target rank
    const pieceType = piece.charAt(1).toLowerCase(); // e.g., 'P' -> 'p'
    const startRank = sourceSquare.charAt(1);
    const endRank = targetSquare.charAt(1);
    
    if (pieceType === 'p' && 
        ((piece.charAt(0) === 'w' && startRank === '7' && endRank === '8') || 
         (piece.charAt(0) === 'b' && startRank === '2' && endRank === '1')))
    {
        // Defaulting promotion to Queen for simplicity
        // A real implementation might ask the user
        promotion = 'q'; 
    }

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: promotion, 
    };

    const moveResult = makeAMove(move);
    return moveResult;
  }

  function resetGame() {
    game.reset();
    setFen(game.fen());
    setGameOver(false);
    updateStatus();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}><TranslatableText>Play Chess</TranslatableText></h1>
      <div className={styles.boardContainer}>
        <Chessboard 
          id="BasicChessboard"
          position={fen} 
          onPieceDrop={onDrop} 
          boardWidth={560} // Adjust size as needed
          arePiecesDraggable={!gameOver}
        />
      </div>
      <p className={styles.status}><TranslatableText>{status}</TranslatableText></p>
      {gameOver && (
        <button onClick={resetGame} className={styles.resetButton}>
          <TranslatableText>Play Again</TranslatableText>
        </button>
      )}
    </div>
  );
}
