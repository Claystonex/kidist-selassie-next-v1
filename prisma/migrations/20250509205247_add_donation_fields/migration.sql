-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "donorEmail" TEXT,
ADD COLUMN     "donorName" TEXT,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "receiptSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurringPeriod" TEXT;

-- CreateTable
CREATE TABLE "ChessChallenge" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChessChallenge_pkey" PRIMARY KEY ("id")
);
