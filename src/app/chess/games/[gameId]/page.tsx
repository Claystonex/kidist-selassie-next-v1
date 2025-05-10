'use client';

import { useParams, useSearchParams } from 'next/navigation';
import SimpleChessGame from '@/components/chess/SimpleChessGame';

export default function ChessGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.gameId as string;
  const isSpectator = searchParams.get('spectate') === 'true';
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        {isSpectator ? 'Spectating Chess Game' : 'Chess Game'}
      </h1>
      <SimpleChessGame gameId={gameId} asSpectator={isSpectator} />
    </div>
  );
}
