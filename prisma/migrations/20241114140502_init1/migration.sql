/*
  Warnings:

  - Made the column `user_pfp_link` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "user_pfp_link" SET NOT NULL,
ALTER COLUMN "user_pfp_link" SET DEFAULT 'https://www.shutterstock.com/shutterstock/photos/1677509740/display_1500/stock-vector-default-avatar-profile-icon-social-media-user-vector-1677509740.jpg';
