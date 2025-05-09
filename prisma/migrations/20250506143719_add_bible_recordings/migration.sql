/*
  Warnings:

  - The values [CAREER_SUPPORT] on the enum `PostType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `scripture` on the `DailyVerse` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `DailyVerse` table. All the data in the column will be lost.
  - You are about to drop the column `donorEmail` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `donorName` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `receiptSent` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `recurringPeriod` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `Donation` table. All the data in the column will be lost.
  - Added the required column `reference` to the `DailyVerse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `DailyVerse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Donation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "FileType" ADD VALUE 'VIDEO';

-- AlterEnum
BEGIN;
CREATE TYPE "PostType_new" AS ENUM ('GENERAL_DISCUSSION', 'ART_EXPRESSION', 'EDUCATIONAL', 'DAILY_INSPIRATION', 'HUMOR');
ALTER TABLE "ForumPost" ALTER COLUMN "type" TYPE "PostType_new" USING ("type"::text::"PostType_new");
ALTER TYPE "PostType" RENAME TO "PostType_old";
ALTER TYPE "PostType_new" RENAME TO "PostType";
DROP TYPE "PostType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_userId_fkey";

-- DropIndex
DROP INDEX "Donation_paymentId_key";

-- AlterTable
ALTER TABLE "DailyVerse" DROP COLUMN "scripture",
DROP COLUMN "title",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL,
ADD COLUMN     "translation" TEXT NOT NULL DEFAULT 'KJV';

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "donorEmail",
DROP COLUMN "donorName",
DROP COLUMN "message",
DROP COLUMN "paymentId",
DROP COLUMN "paymentType",
DROP COLUMN "receiptSent",
DROP COLUMN "recurringPeriod",
DROP COLUMN "subscriptionId",
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "recurringId" TEXT,
ADD COLUMN     "transactionId" TEXT,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "BibleRecording" (
    "id" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "bookName" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BibleRecording_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
