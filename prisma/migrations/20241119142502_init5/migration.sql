-- AlterTable
ALTER TABLE "Court" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Court_Availability" ADD COLUMN     "Day_of_week" BOOLEAN[] DEFAULT ARRAY[true, true, true, true, true, true, true]::BOOLEAN[];
