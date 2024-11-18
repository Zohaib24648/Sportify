-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_slot_id_fkey";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "slot_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "Slot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
