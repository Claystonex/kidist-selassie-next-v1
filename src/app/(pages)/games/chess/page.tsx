/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import TranslatableText from '@/app/_components/TranslatableText';
import styles from '@/styles/ChessGame.module.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// Using module augmentation for chess.js type definitions
import { Chess } from 'chess.js';

// Augment the module definition instead of redeclaring
declare module 'chess.js' {
  interface ChessInstance {
    fen(): string;
    move(move: string | { from: string; to: string; promotion?: string }): any;
    isCheckmate(): boolean;
    isDraw(): boolean;
    isStalemate(): boolean;
    isThreefoldRepetition(): boolean;
    isInsufficientMaterial(): boolean;
    isCheck(): boolean;
    turn(): string;
    reset(): void;
    moves(options?: { verbose?: boolean }): any[];
    history(): any[];
  }
  export interface Chess extends ChessInstance {}
} 

// Simple chess engine implementation
class ChessEngine {
  private game: Chess;
  private difficulty: number; // 1-10, where 10 is the hardest
  
  constructor(game: Chess, difficulty = 3) {
    this.game = game;
    this.difficulty = difficulty;
  }
  
  setDifficulty(difficulty: number) {
    this.difficulty = Math.max(1, Math.min(10, difficulty));
  }
  
  // Find the best move for the current position
  findBestMove(): { from: string; to: string; promotion?: string } | null {
    const possibleMoves = this.game.moves({ verbose: true });
    if (possibleMoves.length === 0) return null;
    
    // At lower difficulties, sometimes make a random move
    if (Math.random() < (1 - this.difficulty / 10) * 0.7) {
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      const randomMove = possibleMoves[randomIndex];
      if (randomMove) {
        return {
          from: randomMove.from,
          to: randomMove.to,
          promotion: randomMove.promotion
        };
      }
    }
    
    // If we didn't return a random move, continue with evaluation
    
    // Simple evaluation function - just counts material
    // Define piece values for evaluation
    // Using an index signature to allow string indexing
    const pieceValues: { [key: string]: number } = {
      p: 1,   // pawn
      n: 3,   // knight
      b: 3,   // bishop
      r: 5,   // rook
      q: 9,   // queen
      k: 0    // king (not counted for material)
    };
    
    // Evaluate a position based on material count
    const evaluatePosition = (fen: string) => {
      let score = 0;
      const position = fen.split(' ')[0];
      
      if (!position) return score;
      
      // Process each character in the position
      for (const char of position) {
        // Skip non-piece characters like '/' and numbers
        if (!/[pnbrqkPNBRQK]/.test(char)) continue;
        
        const lowerChar = char.toLowerCase();
        
        // Get piece value safely with a switch statement
        let pieceValue = 0;
        switch (lowerChar) {
          case 'p': pieceValue = 1; break; // pawn
          case 'n': pieceValue = 3; break; // knight
          case 'b': pieceValue = 3; break; // bishop
          case 'r': pieceValue = 5; break; // rook
          case 'q': pieceValue = 9; break; // queen
          // king has no material value in our evaluation
        }
        
        // If it's lowercase in the original, it's a black piece
        if (char === lowerChar) {
          score -= pieceValue;
        } else {
          // Otherwise it's a white piece (uppercase)
          score += pieceValue;
        }
      }
      
      return score;
    };
    
    // For each possible move, make the move, evaluate the position, then undo
    let bestMove = possibleMoves.length > 0 ? possibleMoves[0] : null;
    let bestScore = -Infinity;
    
    for (const move of possibleMoves) {
      this.game.move(move);
      
      // Evaluate the position after the move
      const score = -evaluatePosition(this.game.fen()); // Negate because we're evaluating from opponent's perspective
      
      // Add some randomness based on difficulty
      const randomFactor = (10 - this.difficulty) * Math.random() * 2;
      const adjustedScore = score + randomFactor;
      
      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestMove = move;
      }
      
      // Undo the move
      this.game.undo();
    }
    
    if (bestMove) {
      return {
        from: bestMove.from,
        to: bestMove.to,
        promotion: bestMove.promotion
      };
    }
    
    // This should never happen if possibleMoves.length > 0, but TypeScript needs it
    return null;
  }
}

export default function ChessGamePage() {
  const game = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(game.fen());
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState('');
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(3); // 1-10 scale
  // const [sliderValue, setSliderValue] = useState(3); // Separate state for slider value during dragging
  const [thinking, setThinking] = useState(false);
  
  // Create the chess engine
  const engine = useMemo(() => new ChessEngine(game, difficulty), [game, difficulty]);
  
  const updateStatus = useCallback(() => {
    let moveColor = 'White';
    if (game.turn() === 'b') {
      moveColor = 'Black';
    }

    if (game.isCheckmate()) {
      setStatus(`Game over, ${moveColor} is in checkmate.`);
      setGameOver(true);
    } else if (game.isDraw()) {
      let reason = 'drawn position';
      if (game.isStalemate()) {
        reason = 'stalemate';
      } else if (game.isThreefoldRepetition()) {
        reason = 'threefold repetition';
      } else if (game.isInsufficientMaterial()) {
        reason = 'insufficient material';
      }
      setStatus(`Game over, ${reason}.`);
      setGameOver(true);
    } else {
      setStatus(moveColor + ' to move.');
      if (game.isCheck()) {
        setStatus((prev) => prev + ' ' + moveColor + ' is in check.');
      }
    }
  }, [game]);

  // Make a move and update the game state
  const makeAMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
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
  }, [game, updateStatus]);
  
  // Computer makes a move
  const computerMove = useCallback(() => {
    if (gameOver) return;
    
    // Only make a move if it's the computer's turn
    const computerColor = playerColor === 'white' ? 'b' : 'w';
    if (game.turn() !== computerColor) return;
    
    setThinking(true);
    
    // Add a slight delay to simulate "thinking"
    setTimeout(() => {
      const move = engine.findBestMove();
      if (move) {
        makeAMove(move);
      }
      setThinking(false);
    }, 500 + Math.random() * 1000); // Random delay between 500-1500ms
  }, [game, gameOver, playerColor, engine, makeAMove]);
  
  // Handle player's move
  const onDrop = useCallback((sourceSquare: string, targetSquare: string, piece: string) => {
    if (gameOver || thinking) return false;
    
    // Only allow moves if it's the player's turn
    const playerTurn = playerColor === 'white' ? 'w' : 'b';
    if (game.turn() !== playerTurn) return false;

    // Check for promotion
    let promotion = undefined;
    const pieceType = piece.charAt(1).toLowerCase();
    const startRank = sourceSquare.charAt(1);
    const endRank = targetSquare.charAt(1);
    
    if (pieceType === 'p' && 
        ((piece.charAt(0) === 'w' && startRank === '7' && endRank === '8') || 
         (piece.charAt(0) === 'b' && startRank === '2' && endRank === '1')))
    {
        promotion = 'q'; // Default to queen for simplicity
    }

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion, 
    };

    const moveResult = makeAMove(move);
    
    // If player's move was successful, let computer make a move
    if (moveResult) {
      setTimeout(computerMove, 300);
    }
    
    return moveResult;
  }, [game, gameOver, thinking, playerColor, makeAMove, computerMove]);

  // Start a new game
  const startGame = useCallback(() => {
    game.reset();
    setFen(game.fen());
    setGameOver(false);
    setGameStarted(true);
    updateStatus();
    
    // If player is black, computer (white) makes first move
    if (playerColor === 'black') {
      setTimeout(computerMove, 500);
    }
  }, [game, playerColor, computerMove, updateStatus]);
  
  // Reset the game
  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameOver(false);
    game.reset();
    setFen(game.fen());
  }, [game]);
  
  // Update engine difficulty when slider changes
  useEffect(() => {
    engine.setDifficulty(difficulty);
    // Keep slider value in sync with difficulty
    setDifficulty(difficulty);
  }, [engine, difficulty]);

  // Setup screen before game starts
  if (!gameStarted) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6"><TranslatableText>Play Against Computer</TranslatableText></h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle><TranslatableText>Choose Your Color</TranslatableText></CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              defaultValue={playerColor} 
              onValueChange={(value) => setPlayerColor(value as 'white' | 'black')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="white" id="white" />
                <Label htmlFor="white"><TranslatableText>White</TranslatableText></Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="black" id="black" />
                <Label htmlFor="black"><TranslatableText>Black</TranslatableText></Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              <TranslatableText>{`Difficulty Level: ${difficulty}`}</TranslatableText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={[difficulty]}
              min={1}
              max={10}
              step={1}
              onValueChange={(values) => {
                if (values[0] !== undefined) {
                  // Update the slider value immediately for visual feedback
                  setDifficulty(values[0]);
                }
              }}
              onValueCommit={(values) => {
                if (values[0] !== undefined) {
                  // Update the actual difficulty when slider is released
                  setDifficulty(values[0]);
                }
              }}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span><TranslatableText>Easy</TranslatableText></span>
              <span><TranslatableText>Hard</TranslatableText></span>
            </div>
          </CardContent>
        </Card>
        
        <Button onClick={startGame} className="w-full">
          <TranslatableText>Start Game</TranslatableText>
        </Button>
      </div>
    );
  }

  // Game screen
  return (
    <div className="container mx-auto py-8 max-w-md">
      <h1 className="text-3xl font-bold text-center mb-4"><TranslatableText>Play Chess</TranslatableText></h1>
      
      <div className="mb-4">
        <Chessboard 
          id="ComputerChessboard"
          position={fen} 
          onPieceDrop={onDrop} 
          boardOrientation={playerColor}
          arePiecesDraggable={!gameOver && !thinking && game.turn() === (playerColor === 'white' ? 'w' : 'b')}
        />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm">
          <p><TranslatableText>Playing as: </TranslatableText>
            <span className="font-bold">{playerColor === 'white' ? 'White' : 'Black'}</span>
          </p>
          <p><TranslatableText>Difficulty: </TranslatableText>
            <span className="font-bold">{difficulty}/10</span>
          </p>
        </div>
        
        <Button onClick={resetGame} variant="outline" size="sm">
          <TranslatableText>New Game</TranslatableText>
        </Button>
      </div>
      
      <div className="p-3 bg-muted rounded-md text-center">
        <p className="text-sm">
          {thinking ? (
            <TranslatableText>Computer is thinking...</TranslatableText>
          ) : (
            <TranslatableText>{status}</TranslatableText>
          )}
        </p>
        
        {gameOver && (
          <Button onClick={startGame} className="mt-2">
            <TranslatableText>Play Again</TranslatableText>
          </Button>
        )}
      </div>
    </div>
  );
}
