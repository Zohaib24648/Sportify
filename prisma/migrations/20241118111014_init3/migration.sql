/*
  Warnings:

  - You are about to alter the column `total_amount` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `paid_amount` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `hourly_rate` on the `Court` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `min_down_payment` on the `Court` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `payment_amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "total_amount" SET DATA TYPE INTEGER,
ALTER COLUMN "paid_amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Court" ALTER COLUMN "hourly_rate" SET DATA TYPE INTEGER,
ALTER COLUMN "min_down_payment" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "payment_amount" SET DATA TYPE INTEGER;
