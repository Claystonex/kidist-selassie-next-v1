'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function SimpleChessLobby() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [gameId, setGameId] = useState('');
  
  // Create a new game with a random ID
  const createNewGame = () => {
    if (!isLoaded || !user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to create a game',
        variant: 'destructive'
      });
      return;
    }
    
    // Generate a simple random ID
    const newGameId = uuidv4().substring(0, 8);
    
    // Route to the new game page
    router.push(`/chess/games/${newGameId}`);
  };
  
  // Join an existing game by ID
  const joinGame = () => {
    if (!gameId.trim()) {
      toast({
        title: 'Game ID Required',
        description: 'Please enter a valid game ID',
        variant: 'destructive'
      });
      return;
    }
    
    // Route to the game page
    router.push(`/chess/games/${gameId.trim()}`);
  };
  
  // Spectate a game (join as viewer)
  const spectateGame = () => {
    if (!gameId.trim()) {
      toast({
        title: 'Game ID Required',
        description: 'Please enter a valid game ID',
        variant: 'destructive'
      });
      return;
    }
    
    // Route to the game page with spectator mode
    router.push(`/chess/games/${gameId.trim()}?spectate=true`);
  };
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Chess Lobby</CardTitle>
          <CardDescription>Play online chess with other members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button 
              onClick={createNewGame} 
              size="lg" 
              className="w-full font-bold"
            >
              Create New Game
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="gameId">Game ID</Label>
              <div className="flex w-full items-center space-x-2">
                <Input
                  id="gameId"
                  placeholder="Enter game ID"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={joinGame} 
                className="flex-1"
              >
                Join Game
              </Button>
              <Button 
                onClick={spectateGame} 
                variant="outline" 
                className="flex-1"
              >
                Spectate Game
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-lg mb-2">Creating a Game</h3>
            <p className="text-muted-foreground">
              Click the "Create New Game" button to start a new chess game. Share the Game ID with your opponent so they can join.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">Joining a Game</h3>
            <p className="text-muted-foreground">
              Enter the Game ID provided by your opponent and click "Join Game" to join an existing game.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">Game Rules</h3>
            <p className="text-muted-foreground">
              Standard chess rules apply. Games can end in checkmate, stalemate, draw by agreement, or when a player resigns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
