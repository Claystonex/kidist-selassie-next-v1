"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TranslatableText from '@/app/_components/TranslatableText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faRobot, faUser, faRedo, faArrowLeft, faBrain } from '@fortawesome/free-solid-svg-icons';

interface Player {
  id: string;
  name: string;
  score: number;
  turnScore: number;
  isComputer: boolean;
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gameWinner: string | null;
  gameStarted: boolean;
  lastRoll: number | null;
}

export default function ComputerDiceGame() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    gameWinner: null,
    gameStarted: false,
    lastRoll: null
  });
  
  const [isRolling, setIsRolling] = useState(false);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [computerThinking, setComputerThinking] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoaded, router]);

  // Initialize game with player and computer
  useEffect(() => {
    if (user && gameState.players.length === 0) {
      const humanPlayer: Player = {
        id: 'human',
        name: user.firstName || user.username || 'Player',
        score: 0,
        turnScore: 0,
        isComputer: false
      };
      
      const computerPlayer: Player = {
        id: 'computer',
        name: 'AI Opponent',
        score: 0,
        turnScore: 0,
        isComputer: true
      };
      
      setGameState(prev => ({
        ...prev,
        players: [humanPlayer, computerPlayer]
      }));
      
      addToLog('Game initialized! You vs AI Opponent');
    }
  }, [user, gameState.players.length]);

  // Computer AI logic
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameWinner && gameState.players[gameState.currentPlayerIndex]?.isComputer && !isRolling && !computerThinking) {
      const computerMove = setTimeout(() => {
        makeComputerMove();
      }, 1000); // Give player time to see what's happening
      
      return () => clearTimeout(computerMove);
    }
  }, [gameState.currentPlayerIndex, gameState.gameStarted, gameState.gameWinner, isRolling, computerThinking]);

  const addToLog = (message: string) => {
    setGameLog(prev => [message, ...prev.slice(0, 12)]); // Keep last 13 messages
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true
    }));
    addToLog('🎮 Game started! Good luck against the AI!');
  };

  const rollDice = async () => {
    if (gameState.gameWinner || !gameState.gameStarted) return;
    
    setIsRolling(true);
    
    // Simulate rolling animation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const roll = Math.floor(Math.random() * 6) + 1;
    setGameState(prev => ({ ...prev, lastRoll: roll }));
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    if (roll === 1) {
      // Player rolled a 1 - lose turn and turn score
      addToLog(`💥 ${currentPlayer.name} rolled a 1! Turn ends, no points added.`);
      endTurn();
    } else {
      // Add to turn score
      setGameState(prev => ({
        ...prev,
        players: prev.players.map((player, index) =>
          index === prev.currentPlayerIndex
            ? { ...player, turnScore: player.turnScore + roll }
            : player
        )
      }));
      addToLog(`🎲 ${currentPlayer.name} rolled a ${roll}! Turn total: ${currentPlayer.turnScore + roll}`);
    }
    
    setIsRolling(false);
  };

  const holdTurn = () => {
    if (gameState.gameWinner || !gameState.gameStarted) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    const newScore = currentPlayer.score + currentPlayer.turnScore;
    
    setGameState(prev => ({
      ...prev,
      players: prev.players.map((player, index) =>
        index === prev.currentPlayerIndex
          ? { ...player, score: newScore, turnScore: 0 }
          : player
      )
    }));
    
    addToLog(`🏦 ${currentPlayer.name} banks ${currentPlayer.turnScore} points! Total: ${newScore}`);
    
    // Check for winner
    if (newScore >= 100) {
      setGameState(prev => ({ ...prev, gameWinner: currentPlayer.name }));
      if (currentPlayer.isComputer) {
        addToLog(`🤖 AI Opponent wins with ${newScore} points! Better luck next time!`);
      } else {
        addToLog(`🎉 You win with ${newScore} points! Great job beating the AI!`);
      }
    } else {
      endTurn();
    }
  };

  const endTurn = () => {
    setGameState(prev => ({
      ...prev,
      currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
      players: prev.players.map((player, index) =>
        index === prev.currentPlayerIndex
          ? { ...player, turnScore: 0 }
          : player
      )
    }));
  };

  // AI Decision Making
  const makeComputerMove = async () => {
    setComputerThinking(true);
    const computer = gameState.players[gameState.currentPlayerIndex];
    if (!computer || !computer.isComputer) return;

    // AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // AI strategy: 
    // - If turn score >= 20 and total would be >= 75, always hold
    // - If turn score >= 25, always hold 
    // - If opponent is close to winning (>= 85), take more risks
    // - Otherwise use a probability-based decision
    
    const opponent = gameState.players.find(p => !p.isComputer);
    const opponentCloseToWinning = opponent && opponent.score >= 85;
    const currentTurnScore = computer.turnScore;
    const wouldWinIfHold = computer.score + currentTurnScore >= 100;
    
    let shouldHold = false;
    
    if (wouldWinIfHold) {
      shouldHold = true;
      addToLog('🧠 AI thinking: "I can win if I hold!"');
    } else if (currentTurnScore >= 25) {
      shouldHold = true;
      addToLog('🧠 AI thinking: "25+ points is enough for this turn"');
    } else if (currentTurnScore >= 20 && computer.score + currentTurnScore >= 75) {
      shouldHold = true;
      addToLog('🧠 AI thinking: "Good position, better secure these points"');
    } else if (opponentCloseToWinning && currentTurnScore < 15) {
      shouldHold = false;
      addToLog('🧠 AI thinking: "Opponent is close to winning, I need to take risks!"');
    } else if (currentTurnScore >= 15) {
      // Probability decision: higher turn score = more likely to hold
      const holdProbability = Math.min(0.8, currentTurnScore / 25);
      shouldHold = Math.random() < holdProbability;
      addToLog(`🧠 AI thinking: "Should I risk another roll or hold ${currentTurnScore} points?"`);
    }
    
    setComputerThinking(false);
    
    if (shouldHold && currentTurnScore > 0) {
      holdTurn();
    } else {
      rollDice();
    }
  };

  const resetGame = () => {
    const humanPlayer: Player = {
      id: 'human',
      name: user?.firstName || user?.username || 'Player',
      score: 0,
      turnScore: 0,
      isComputer: false
    };
    
    const computerPlayer: Player = {
      id: 'computer',
      name: 'AI Opponent',
      score: 0,
      turnScore: 0,
      isComputer: true
    };
    
    setGameState({
      players: [humanPlayer, computerPlayer],
      currentPlayerIndex: 0,
      gameWinner: null,
      gameStarted: false,
      lastRoll: null
    });
    setGameLog(['New game ready! Click Start Game to begin.']);
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#086c47]">
        <div className="text-[#ffb43c] text-xl font-montserrat">
          <TranslatableText>Loading...</TranslatableText>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const humanPlayer = gameState.players.find(p => !p.isComputer);
  const computerPlayer = gameState.players.find(p => p.isComputer);

  return (
    <div className="min-h-screen bg-[#086c47] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Link 
              href="/games/dice" 
              className="absolute left-4 text-white hover:text-[#ffb43c] transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
            </Link>
            <h1 className="text-4xl font-bold text-[#ffb43c] font-montserrat">
              <FontAwesomeIcon icon={faRobot} className="mr-3" />
              <TranslatableText>Player vs AI</TranslatableText>
            </h1>
          </div>
          <p className="text-white text-lg">
            <TranslatableText>Challenge our smart AI opponent! First to 100 points wins!</TranslatableText>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players Display */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-[#ffb43c] mb-4 flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <TranslatableText>Players</TranslatableText>
              </h2>
              
              <div className="space-y-4">
                {/* Human Player */}
                {humanPlayer && (
                  <div className={`p-4 rounded-lg ${
                    currentPlayer?.id === 'human' && gameState.gameStarted
                      ? 'bg-[#ffb43c] text-[#086c47] border-2 border-yellow-300 shadow-lg'
                      : 'bg-white/20 text-white'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        <span className="font-bold">{humanPlayer.name}</span>
                      </div>
                      <span className="text-xl font-bold">{humanPlayer.score}/100</span>
                    </div>
                    {humanPlayer.turnScore > 0 && (
                      <div className="text-sm opacity-75">
                        <span>Turn score: {humanPlayer.turnScore}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Computer Player */}
                {computerPlayer && (
                  <div className={`p-4 rounded-lg ${
                    currentPlayer?.id === 'computer' && gameState.gameStarted
                      ? 'bg-blue-600 text-white border-2 border-blue-300 shadow-lg'
                      : 'bg-gray-600 text-white'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faRobot} className="mr-2" />
                        <span className="font-bold">{computerPlayer.name}</span>
                        {computerThinking && (
                          <FontAwesomeIcon icon={faBrain} className="ml-2 animate-pulse" />
                        )}
                      </div>
                      <span className="text-xl font-bold">{computerPlayer.score}/100</span>
                    </div>
                    {computerPlayer.turnScore > 0 && (
                      <div className="text-sm opacity-75">
                        <span>Turn score: {computerPlayer.turnScore}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!gameState.gameStarted && (
                <button
                  onClick={startGame}
                  className="w-full mt-6 bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 text-lg"
                >
                  <FontAwesomeIcon icon={faDice} className="mr-2" />
                  <TranslatableText>Start Game!</TranslatableText>
                </button>
              )}

              {gameState.gameWinner && (
                <button
                  onClick={resetGame}
                  className="w-full mt-6 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700"
                >
                  <FontAwesomeIcon icon={faRedo} className="mr-2" />
                  <TranslatableText>Play Again</TranslatableText>
                </button>
              )}
            </div>
          </div>

          {/* Game Area */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm text-center">
              <h2 className="text-xl font-bold text-[#ffb43c] mb-4">
                <TranslatableText>Game Area</TranslatableText>
              </h2>

              {gameState.gameWinner ? (
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-yellow-300 mb-2">
                    {gameState.gameWinner === humanPlayer?.name ? '🎉' : '🤖'}
                  </h3>
                  <h3 className="text-2xl font-bold text-[#ffb43c]">
                    {gameState.gameWinner} <TranslatableText>Wins!</TranslatableText>
                  </h3>
                  <p className="text-white mt-2">
                    {gameState.gameWinner === humanPlayer?.name ? (
                      <TranslatableText>Congratulations! You beat the AI!</TranslatableText>
                    ) : (
                      <TranslatableText>AI wins this round. Try again!</TranslatableText>
                    )}
                  </p>
                </div>
              ) : gameState.gameStarted && currentPlayer ? (
                <div className="mb-6">
                  <h3 className="text-xl text-[#ffb43c] mb-2">
                    <TranslatableText>Current Turn:</TranslatableText>
                  </h3>
                  <div className="flex items-center justify-center mb-2">
                    <FontAwesomeIcon 
                      icon={currentPlayer.isComputer ? faRobot : faUser} 
                      className="mr-2 text-2xl"
                    />
                    <p className="text-2xl font-bold text-white">{currentPlayer.name}</p>
                  </div>
                  <div className="text-sm text-gray-300 mb-4">
                    <p><TranslatableText>Score:</TranslatableText> {currentPlayer.score}/100</p>
                    {currentPlayer.turnScore > 0 && (
                      <p className="text-lg text-yellow-300 font-bold">
                        <TranslatableText>Turn Score:</TranslatableText> {currentPlayer.turnScore}
                      </p>
                    )}
                  </div>
                  {computerThinking && (
                    <div className="text-blue-300 text-sm animate-pulse">
                      <TranslatableText>AI is thinking...</TranslatableText>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-lg text-white">
                    <TranslatableText>Ready to challenge the AI?</TranslatableText>
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    <TranslatableText>Click Start Game to begin!</TranslatableText>
                  </p>
                </div>
              )}

              {/* Dice Display */}
              <div className="mb-6">
                <div className={`mx-auto w-24 h-24 bg-white rounded-lg flex items-center justify-center text-5xl font-bold text-[#086c47] ${isRolling ? 'animate-spin' : ''} shadow-lg border-4 border-yellow-400`}>
                  {gameState.lastRoll || '?'}
                </div>
                {gameState.lastRoll && !isRolling && (
                  <p className="text-sm text-gray-300 mt-2">
                    <TranslatableText>Last roll:</TranslatableText> {gameState.lastRoll}
                  </p>
                )}
              </div>

              {/* Game Controls - Only show for human player */}
              {gameState.gameStarted && !gameState.gameWinner && currentPlayer && !currentPlayer.isComputer && (
                <div className="space-y-3">
                  <button
                    onClick={rollDice}
                    disabled={isRolling}
                    className="w-full bg-[#ffb43c] text-[#086c47] px-6 py-3 rounded-lg font-bold hover:bg-[#e6a037] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {isRolling ? (
                      <TranslatableText>Rolling...</TranslatableText>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faDice} className="mr-2" />
                        <TranslatableText>Roll Dice</TranslatableText>
                      </>
                    )}
                  </button>
                  
                  {(currentPlayer?.turnScore ?? 0) > 0 && (
                    <button
                      onClick={holdTurn}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 text-lg"
                    >
                      <TranslatableText>Hold & Bank Points</TranslatableText>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Game Log & AI Info */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm mb-6">
              <h2 className="text-xl font-bold text-[#ffb43c] mb-4">
                <TranslatableText>Game Log</TranslatableText>
              </h2>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {gameLog.length === 0 ? (
                  <div className="text-sm text-gray-400 italic">
                    <TranslatableText>Game actions will appear here...</TranslatableText>
                  </div>
                ) : (
                  gameLog.map((message, index) => (
                    <div key={index} className="text-sm text-white bg-white/10 p-2 rounded">
                      {message}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-[#ffb43c] mb-4">
                <FontAwesomeIcon icon={faBrain} className="mr-2" />
                <TranslatableText>AI Strategy</TranslatableText>
              </h2>
              <div className="text-sm text-white space-y-2">
                <p>🤖 <TranslatableText>Smart decision making</TranslatableText></p>
                <p>⚖️ <TranslatableText>Balances risk vs reward</TranslatableText></p>
                <p>🎯 <TranslatableText>Adapts to your score</TranslatableText></p>
                <p>🧠 <TranslatableText>Thinks before each move</TranslatableText></p>
                <p>💪 <TranslatableText>Becomes aggressive when behind</TranslatableText></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
