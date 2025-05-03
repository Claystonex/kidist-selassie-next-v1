-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "vimeoId" TEXT,
    "vimeoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Uncategorized',
    "uploader" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);
