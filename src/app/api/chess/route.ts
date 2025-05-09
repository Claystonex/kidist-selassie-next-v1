import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Schema for creating a chess challenge
const createChallengeSchema = z.object({
  opponentId: z.string(),
});

// Schema for accepting a chess challenge
const acceptChallengeSchema = z.object({
  challengeId: z.string(),
});

// Chess challenge type for typescript
type ChessChallenge = {
  id: string;
  challengerId: string;
  opponentId: string;
  status: string;
  matchId: string;
  winnerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Generate a random matchID
function generateMatchId() {
  return Math.random().toString(36).substring(2, 15);
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { opponentId } = createChallengeSchema.parse(body);
    const matchId = generateMatchId();
    
    // Create a new chess challenge using raw SQL
    const challenge = await db.$queryRaw<ChessChallenge[]>`
      INSERT INTO "ChessChallenge" ("id", "challengerId", "opponentId", "status", "matchId", "createdAt", "updatedAt")
      VALUES (${Prisma.raw('gen_random_uuid()')}, ${userId}, ${opponentId}, 'pending', ${matchId}, ${Prisma.raw('NOW()')}, ${Prisma.raw('NOW()')})
      RETURNING *;
    `;

    return NextResponse.json(challenge[0]);
  } catch (error) {
    console.error("[CHESS_CHALLENGE_POST]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { challengeId } = acceptChallengeSchema.parse(body);
    
    // Get the challenge
    const challenge = await db.$queryRaw<ChessChallenge[]>`
      SELECT * FROM "ChessChallenge" WHERE "id" = ${challengeId} LIMIT 1;
    `;
    
    if (!challenge[0]) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }
    
    // Check if the user is the opponent
    if (challenge[0].opponentId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to accept this challenge" },
        { status: 403 }
      );
    }
    
    // Update the challenge status to accepted
    const updatedChallenge = await db.$queryRaw<ChessChallenge[]>`
      UPDATE "ChessChallenge" 
      SET "status" = 'accepted', "updatedAt" = ${Prisma.raw('NOW()')}
      WHERE "id" = ${challengeId}
      RETURNING *;
    `;

    return NextResponse.json(updatedChallenge[0]);
  } catch (error) {
    console.error("[CHESS_CHALLENGE_PUT]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all challenges for the user (both as challenger and opponent)
    const challenges = await db.$queryRaw<ChessChallenge[]>`
      SELECT * FROM "ChessChallenge" 
      WHERE "challengerId" = ${userId} OR "opponentId" = ${userId}
      ORDER BY "createdAt" DESC;
    `;

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("[CHESS_CHALLENGE_GET]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
