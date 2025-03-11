-- DropForeignKey
ALTER TABLE "ForumPost" DROP CONSTRAINT "ForumPost_authorId_fkey";

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
