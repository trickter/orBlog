-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "email" TEXT
);
