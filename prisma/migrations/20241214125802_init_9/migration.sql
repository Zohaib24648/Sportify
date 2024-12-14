-- AlterEnum
ALTER TYPE "GAME_TYPE" ADD VALUE 'both';

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "payment_image_link" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password_hash" DROP NOT NULL,
ALTER COLUMN "user_pfp_link" DROP NOT NULL,
ALTER COLUMN "user_pfp_link" DROP DEFAULT;
