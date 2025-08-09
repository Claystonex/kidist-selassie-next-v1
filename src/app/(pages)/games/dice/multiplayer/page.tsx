"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TranslatableText from '@/app/_components/TranslatableText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faUsers, faPlay, faRedo, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface Player {
  id: string;
  name: string;
  score: number;
  turnScore: number;
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gameWinner: string | null;
  gameStarted: boolean;
  lastRoll: number | null;
}

export default function MultiplayerDiceGame() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    gameWinner: null,
    gameStarted: false,
    lastRoll: null
  });
  
  const [playerName, setPlayerName] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [gameLog, setGameLog] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoaded, router]);

  // Initialize player name when user loads
  useEffect(() => {
    if (user && !playerName) {
      setPlayerName(user.firstName || user.username || 'Player');
    }
  }, [user, playerName]);

  const addPlayer = () => {
    if (playerName.trim() && gameState.players.length < 4) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: playerName.trim(),
        score: 0,
        turnScore: 0
      };
      
      setGameState(prev => ({
        ...prev,
        players: [...prev.players, newPlayer]
      }));
      
      setPlayerName('');
      addToLog(`${newPlayer.name} joined the game!`);
    }
  };

  const startGame = () => {
    if (gameState.players.length >= 2) {
      setGameState(prev => ({
        ...prev,
        gameStarted: true
      }));
      addToLog(`Game started with ${gameState.players.length} players!`);
    }
  };

  const addToLog = (message: string) => {
    setGameLog(prev => [message, ...prev.slice(0, 9)]); // Keep only last 10 messages
  };

  const rollDice = async () => {
    if (gameState.gameWinner || !gameState.gameStarted) return;
    
    setIsRolling(true);
    
    // Simulate rolling animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roll = Math.floor(Math.random() * 6) + 1;
    setGameState(prev => ({ ...prev, lastRoll: roll }));
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (!currentPlayer) return;
    
    if (roll === 1) {
      // Player rolled a 1 - lose turn and turn score
      addToLog(`${currentPlayer.name} rolled a 1! Turn ends, no points added.`);
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
      addToLog(`${currentPlayer.name} rolled a ${roll}!`);
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
    
    addToLog(`${currentPlayer.name} holds and scores ${currentPlayer.turnScore} points! Total: ${newScore}`);
    
    // Check for winner
    if (newScore >= 100) {
      setGameState(prev => ({ ...prev, gameWinner: currentPlayer.name }));
      addToLog(`🎉 ${currentPlayer.name} wins with ${newScore} points!`);
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

  const resetGame = () => {
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      gameWinner: null,
      gameStarted: false,
      lastRoll: null
    });
    setGameLog([]);
    setPlayerName(user?.firstName || user?.username || 'Player');
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
              <FontAwesomeIcon icon={faUsers} className="mr-3" />
              <TranslatableText>Multiplayer Dice Game</TranslatableText>
            </h1>
          </div>
          <p className="text-white text-lg">
            <TranslatableText>Compete against friends! First to 100 points wins!</TranslatableText>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Setup */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-[#ffb43c] mb-4 flex items-center">
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                <TranslatableText>Players</TranslatableText>
                <span className="ml-1">({gameState.players.length}/4)</span>
              </h2>
              
              {!gameState.gameStarted && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter player name"
                    className="w-full p-2 rounded border mb-2 text-black"
                    maxLength={20}
                    onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                  />
                  <button
                    onClick={addPlayer}
                    disabled={!playerName.trim() || gameState.players.length >= 4}
                    className="w-full bg-[#ffb43c] text-[#086c47] px-4 py-2 rounded font-bold hover:bg-[#e6a037] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TranslatableText>Add Player</TranslatableText>
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {gameState.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded ${
                      index === gameState.currentPlayerIndex && gameState.gameStarted
                        ? 'bg-[#ffb43c] text-[#086c47] border-2 border-yellow-300'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{player.name}</span>
                      <span className="text-lg font-bold">{player.score} pts</span>
                    </div>
                    {player.turnScore > 0 && (
                      <div className="text-sm opacity-75 flex justify-between">
                        <span>Turn score: {player.turnScore}</span>
                        <span>Total if held: {player.score + player.turnScore}</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {gameState.players.length < 4 && !gameState.gameStarted && (
                  <div className="p-3 rounded bg-white/10 text-gray-300 text-center border-2 border-dashed border-gray-400">
                    <TranslatableText>Add more players...</TranslatableText>
                  </div>
                )}
              </div>

              {!gameState.gameStarted && gameState.players.length >= 2 && (
                <button
                  onClick={startGame}
                  className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 text-lg"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  <TranslatableText>Start Game!</TranslatableText>
                </button>
              )}

              {gameState.gameWinner && (
                <button
                  onClick={resetGame}
                  className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
                >
                  <FontAwesomeIcon icon={faRedo} className="mr-2" />
                  <TranslatableText>New Game</TranslatableText>
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
                  <h3 className="text-3xl font-bold text-yellow-300 mb-2">🎉</h3>
                  <h3 className="text-2xl font-bold text-[#ffb43c]">
                    {gameState.gameWinner} <TranslatableText>Wins!</TranslatableText>
                  </h3>
                  <p className="text-white mt-2">
                    <TranslatableText>Congratulations on reaching 100 points!</TranslatableText>
                  </p>
                </div>
              ) : gameState.gameStarted && currentPlayer ? (
                <div className="mb-6">
                  <h3 className="text-xl text-[#ffb43c] mb-2">
                    <TranslatableText>Current Player:</TranslatableText>
                  </h3>
                  <p className="text-2xl font-bold text-white mb-2">{currentPlayer.name}</p>
                  <div className="text-sm text-gray-300 mb-4">
                    <p><TranslatableText>Total Score:</TranslatableText> {currentPlayer.score}/100</p>
                    {currentPlayer.turnScore > 0 && (
                      <p className="text-lg text-yellow-300 font-bold">
                        <TranslatableText>Turn Score:</TranslatableText> {currentPlayer.turnScore}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-lg text-white">
                    <TranslatableText>Add at least 2 players to start!</TranslatableText>
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    <TranslatableText>You can add up to 4 players total.</TranslatableText>
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

              {/* Game Controls */}
              {gameState.gameStarted && !gameState.gameWinner && (
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

          {/* Game Log & Rules */}
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
                <TranslatableText>Quick Rules</TranslatableText>
              </h2>
              <div className="text-sm text-white space-y-2">
                <p>🎯 <TranslatableText>First to 100 points wins</TranslatableText></p>
                <p>🎲 <TranslatableText>Roll 2-6: Add to turn score</TranslatableText></p>
                <p>💥 <TranslatableText>Roll 1: Lose turn, no points</TranslatableText></p>
                <p>🏦 <TranslatableText>Hold: Bank points, next player</TranslatableText></p>
                <p>⚡ <TranslatableText>Strategy: Risk vs reward!</TranslatableText></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
