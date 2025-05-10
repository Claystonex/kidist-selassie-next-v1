import React from 'react';
import { Metadata } from 'next';
import SimpleChessLobby from '@/components/chess/SimpleChessLobby';

export const metadata: Metadata = {
  title: 'Chess | Kidist Selassie Youth International',
  description: 'Play chess with other members of the Kidist Selassie Youth International community.',
};

export default function ChessPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Chess</h1>
      <SimpleChessLobby />
    </div>
  );
}
