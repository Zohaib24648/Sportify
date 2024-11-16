/*
  Warnings:

  - You are about to alter the column `min_down_payment` on the `Court` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - The `payment_method` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PAYMENT_METHOD" AS ENUM ('CASH', 'CARD', 'ONLINE');

-- AlterTable
ALTER TABLE "Court" ALTER COLUMN "min_down_payment" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "payment_method",
ADD COLUMN     "payment_method" "PAYMENT_METHOD" NOT NULL DEFAULT 'ONLINE',
ALTER COLUMN "payment_time" SET DEFAULT CURRENT_TIMESTAMP;
