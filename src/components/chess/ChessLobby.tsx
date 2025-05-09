"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// Import directly with relative path instead of alias
import { ComboboxForm } from '../../components/ui/combobox-form';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, PlusCircle } from 'lucide-react';
// Import directly with relative path instead of alias
import { useToast } from '../../components/ui/use-toast';

interface ChessChallenge {
  id: string;
  challengerId: string;
  opponentId: string;
  status: string;
  matchId: string;
  winnerId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserOption {
  label: string;
  value: string;
}

const ChessLobby: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [challenges, setChallenges] = useState<ChessChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch all challenges
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chess');
      setChallenges(response.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch chess challenges',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for challenge creation
  const fetchUsers = async () => {
    try {
      // This endpoint would need to be implemented to fetch all users
      const response = await axios.get('/api/users');
      
      // Filter out current user and map to options format
      const userOptions = response.data
        .filter((u: any) => u.id !== user?.id)
        .map((u: any) => ({
          label: `${u.firstName} ${u.lastName}`,
          value: u.id,
        }));
        
      setUsers(userOptions);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Load challenges on component mount
  useEffect(() => {
    if (user) {
      fetchChallenges();
      fetchUsers();
    }
  }, [user]);

  // Create a new challenge
  const createChallenge = async () => {
    if (!selectedOpponent) {
      toast({
        title: 'Error',
        description: 'Please select an opponent',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await axios.post('/api/chess', {
        opponentId: selectedOpponent,
      });
      
      toast({
        title: 'Success',
        description: 'Challenge sent successfully',
      });
      
      setDialogOpen(false);
      setSelectedOpponent('');
      fetchChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to create challenge',
        variant: 'destructive',
      });
    }
  };

  // Accept a challenge
  const acceptChallenge = async (challengeId: string) => {
    try {
      const response = await axios.put('/api/chess', {
        challengeId,
      });
      
      toast({
        title: 'Success',
        description: 'Challenge accepted',
      });
      
      // Navigate to the chess game
      router.push(`/chess/game/${response.data.matchId}`);
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept challenge',
        variant: 'destructive',
      });
    }
  };

  // Start an accepted game
  const startGame = (matchId: string, isNewGame = false) => {
    router.push(`/chess/game/${matchId}?new=${isNewGame ? 'true' : 'false'}`);
  };

  // Get status badge for a challenge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return <div className="text-center p-8">Please sign in to access the chess lobby.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chess Lobby</CardTitle>
              <CardDescription>Create and manage your chess challenges</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={fetchChallenges}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Challenge
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Challenge</DialogTitle>
                    <DialogDescription>
                      Select a player to challenge to a chess match.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <ComboboxForm
                        items={users}
                        value={selectedOpponent}
                        onChange={setSelectedOpponent}
                        placeholder="Select an opponent"
                      />
                    </div>
                    <Button onClick={createChallenge}>Send Challenge</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-medium mb-4">Your Chess Challenges</h3>
          
          {loading ? (
            <div className="text-center p-8">Loading...</div>
          ) : challenges.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No chess challenges found. Create one to get started!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Challenger</TableHead>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challenges.map((challenge) => {
                  const isChallenger = challenge.challengerId === user.id;
                  const isOpponent = challenge.opponentId === user.id;
                  const canAccept = isOpponent && challenge.status === 'pending';
                  const canJoinGame = challenge.status === 'accepted';
                  
                  return (
                    <TableRow key={challenge.id}>
                      <TableCell>{getStatusBadge(challenge.status)}</TableCell>
                      <TableCell>
                        {isChallenger ? 'You' : 'Opponent'}
                      </TableCell>
                      <TableCell>
                        {isOpponent ? 'You' : 'Opponent'}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(challenge.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {canAccept ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => acceptChallenge(challenge.id)}
                          >
                            Accept
                          </Button>
                        ) : canJoinGame ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => startGame(challenge.matchId, isChallenger)}
                          >
                            Join Game
                          </Button>
                        ) : challenge.status === 'pending' ? (
                          <span className="text-muted-foreground">Waiting for acceptance</span>
                        ) : (
                          <span className="text-muted-foreground">Game {challenge.status}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-lg mb-2">Creating a Challenge</h3>
            <p className="text-muted-foreground">
              Click the "New Challenge" button and select a player to challenge. When they accept, you'll be randomly assigned white or black pieces.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">Playing a Game</h3>
            <p className="text-muted-foreground">
              When it's your turn, click on a piece to select it, then click on a destination square to move. Invalid moves will be rejected.
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
};

export default ChessLobby;
