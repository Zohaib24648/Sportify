-- CreateEnum
CREATE TYPE "COURT_TYPE" AS ENUM ('indoor', 'outdoor', 'multipurpose');

-- AlterTable
ALTER TABLE "Court" ADD COLUMN     "court_type" "COURT_TYPE" NOT NULL DEFAULT 'outdoor';
