-- CreateTable
CREATE TABLE "books" (
    "book_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "total_pages" INTEGER NOT NULL,
    "genre" TEXT,
    "summary" TEXT,
    "cover_url" TEXT,

    CONSTRAINT "books_pkey" PRIMARY KEY ("book_id")
);
