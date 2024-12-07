/*
  Warnings:

  - You are about to drop the column `game_type_id` on the `CourtGameLink` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[court_id,game_id]` on the table `CourtGameLink` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `game_id` to the `CourtGameLink` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourtGameLink" DROP CONSTRAINT "CourtGameLink_game_type_id_fkey";

-- DropIndex
DROP INDEX "CourtGameLink_court_id_game_type_id_key";

-- AlterTable
ALTER TABLE "CourtGameLink" DROP COLUMN "game_type_id",
ADD COLUMN     "game_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "user_pfp_link" SET DEFAULT 'https://www.shutterstock.com/default-avatar.png';

-- CreateIndex
CREATE UNIQUE INDEX "CourtGameLink_court_id_game_id_key" ON "CourtGameLink"("court_id", "game_id");

-- AddForeignKey
ALTER TABLE "CourtGameLink" ADD CONSTRAINT "CourtGameLink_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
