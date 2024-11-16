/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Game_Type` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Game_Type_name_key" ON "Game_Type"("name");
