/*
  Warnings:

  - You are about to drop the `Court_Game_Type` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Game_Type` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Court_Game_Type" DROP CONSTRAINT "Court_Game_Type_court_id_fkey";

-- DropForeignKey
ALTER TABLE "Court_Game_Type" DROP CONSTRAINT "Court_Game_Type_game_type_id_fkey";

-- DropTable
DROP TABLE "Court_Game_Type";

-- DropTable
DROP TABLE "Game_Type";

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "GAME_TYPE" NOT NULL,
    "person" TEXT DEFAULT '5v5',

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourtGameLink" (
    "id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "game_type_id" TEXT NOT NULL,

    CONSTRAINT "CourtGameLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CourtGameLink_court_id_game_type_id_key" ON "CourtGameLink"("court_id", "game_type_id");

-- AddForeignKey
ALTER TABLE "CourtGameLink" ADD CONSTRAINT "CourtGameLink_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtGameLink" ADD CONSTRAINT "CourtGameLink_game_type_id_fkey" FOREIGN KEY ("game_type_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
