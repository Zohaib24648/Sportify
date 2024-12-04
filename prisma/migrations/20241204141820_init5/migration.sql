-- CreateEnum
CREATE TYPE "GAME_TYPE" AS ENUM ('indoor', 'outdoor');

-- AlterTable
ALTER TABLE "Game_Type" ADD COLUMN     "category" "GAME_TYPE" NOT NULL DEFAULT 'outdoor',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "person" TEXT DEFAULT '5v5';
