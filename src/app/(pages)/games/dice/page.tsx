"use client";

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import TranslatableText from '@/app/_components/TranslatableText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faRobot, faUsers, faPlay } from '@fortawesome/free-solid-svg-icons';

export default function DiceGameLobby() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#086c47]">
        <div className="text-[#ffb43c] text-xl font-montserrat">
          <TranslatableText>Loading...</TranslatableText>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#086c47] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#ffb43c] font-montserrat mb-4">
            <FontAwesomeIcon icon={faDice} className="mr-4" />
            <TranslatableText>Pig Dice Game</TranslatableText>
          </h1>
          <p className="text-white text-xl">
            <TranslatableText>Choose your game mode and start rolling!</TranslatableText>
          </p>
        </div>

        {/* Game Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Play vs Computer */}
          <Link href="/games/dice/computer">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 hover:from-blue-500 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-2xl border-2 border-blue-400">
              <div className="text-center">
                <div className="mb-6">
                  <FontAwesomeIcon icon={faRobot} className="text-6xl text-white mb-4" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  <TranslatableText>Play vs Computer</TranslatableText>
                </h2>
                <p className="text-blue-100 mb-6">
                  <TranslatableText>Challenge our AI opponent in a strategic dice battle. Perfect your skills against a smart computer player!</TranslatableText>
                </p>
                <div className="flex items-center justify-center space-x-2 text-white">
                  <FontAwesomeIcon icon={faPlay} />
                  <span className="font-semibold">
                    <TranslatableText>Start Game</TranslatableText>
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Play vs Friends */}
          <Link href="/games/dice/multiplayer">
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 hover:from-green-500 hover:to-green-700 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-2xl border-2 border-green-400">
              <div className="text-center">
                <div className="mb-6">
                  <FontAwesomeIcon icon={faUsers} className="text-6xl text-white mb-4" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  <TranslatableText>Play vs Friends</TranslatableText>
                </h2>
                <p className="text-green-100 mb-6">
                  <TranslatableText>Compete against your friends and community members. Up to 4 players can join the fun!</TranslatableText>
                </p>
                <div className="flex items-center justify-center space-x-2 text-white">
                  <FontAwesomeIcon icon={faPlay} />
                  <span className="font-semibold">
                    <TranslatableText>Create Room</TranslatableText>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Game Rules */}
        <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-[#ffb43c] mb-6 text-center">
            <TranslatableText>How to Play Pig Dice</TranslatableText>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                <TranslatableText>Game Objective</TranslatableText>
              </h3>
              <div className="text-white space-y-3">
                <p>• <TranslatableText>Be the first player to reach 100 points</TranslatableText></p>
                <p>• <TranslatableText>Each turn, roll the dice to accumulate points</TranslatableText></p>
                <p>• <TranslatableText>Decide when to "hold" to bank your points</TranslatableText></p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                <TranslatableText>Game Rules</TranslatableText>
              </h3>
              <div className="text-white space-y-3">
                <p>• <TranslatableText>Roll any number 2-6: Add to your turn score</TranslatableText></p>
                <p>• <TranslatableText>Roll a 1: Lose all turn points, turn ends</TranslatableText></p>
                <p>• <TranslatableText>"Hold": Add turn score to total, pass turn</TranslatableText></p>
                <p>• <TranslatableText>Strategy: Risk vs reward - when to stop rolling?</TranslatableText></p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-yellow-400 text-[#086c47] px-6 py-3 rounded-lg inline-block font-bold">
              <TranslatableText>💡 Tip: Don't get too greedy - one roll of 1 can ruin your turn!</TranslatableText>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
