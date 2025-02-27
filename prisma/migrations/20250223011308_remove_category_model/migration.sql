/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryToForumPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PostType" ADD VALUE 'DAILY_INSPIRATION';
ALTER TYPE "PostType" ADD VALUE 'HUMOR';
ALTER TYPE "PostType" ADD VALUE 'CAREER_SUPPORT';

-- DropForeignKey
ALTER TABLE "_CategoryToForumPost" DROP CONSTRAINT "_CategoryToForumPost_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToForumPost" DROP CONSTRAINT "_CategoryToForumPost_B_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "_CategoryToForumPost";
