-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('admin', 'moderator', 'user', 'ground_owner');

-- CreateEnum
CREATE TYPE "DAY" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateEnum
CREATE TYPE "MEDIA_TYPE" AS ENUM ('image', 'video', 'audio');

-- CreateEnum
CREATE TYPE "REVIEW_STATUS" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "BOOKING_STATUS" AS ENUM ('pending', 'confirmed', 'cancelled', 'on_hold', 'completed');

-- CreateEnum
CREATE TYPE "PAYMENT_STATUS" AS ENUM ('not_paid', 'paid', 'refunded', 'refund_pending', 'verification_pending');

-- CreateEnum
CREATE TYPE "PAYMENT_METHOD" AS ENUM ('CASH', 'CARD', 'ONLINE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "user_pfp_link" TEXT NOT NULL DEFAULT 'https://www.shutterstock.com/shutterstock/photos/1677509740/display_1500/stock-vector-default-avatar-profile-icon-social-media-user-vector-1677509740.jpg',
    "user_phone" TEXT NOT NULL,
    "secondary_user_phone" TEXT,
    "role" "ROLE"[] DEFAULT ARRAY['user']::"ROLE"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL,
    "court_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "court_location" TEXT NOT NULL,
    "hourly_rate" INTEGER NOT NULL,
    "min_down_payment" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game_Type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Game_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court_Game_Type" (
    "id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "game_type_id" TEXT NOT NULL,

    CONSTRAINT "Court_Game_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court_Specs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Court_Specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court_Media" (
    "id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "media_link" TEXT NOT NULL,
    "media_type" "MEDIA_TYPE" NOT NULL,

    CONSTRAINT "Court_Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court_Availability" (
    "id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "day" "DAY" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "Court_Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court_Close_Dates" (
    "id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "Court_Close_Dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "booking_id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "slot_id" TEXT,
    "status" "BOOKING_STATUS" NOT NULL DEFAULT 'pending',
    "total_amount" INTEGER NOT NULL,
    "paid_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "payment_id" SERIAL NOT NULL,
    "booking_id" TEXT NOT NULL,
    "payment_status" "PAYMENT_STATUS" NOT NULL DEFAULT 'not_paid',
    "payment_amount" INTEGER NOT NULL,
    "payment_method" "PAYMENT_METHOD" NOT NULL DEFAULT 'ONLINE',
    "payment_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_image_link" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published" "REVIEW_STATUS" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_phone_key" ON "User"("user_phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_user_phone_idx" ON "User"("user_phone");

-- CreateIndex
CREATE UNIQUE INDEX "Game_Type_name_key" ON "Game_Type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Court_Game_Type_court_id_game_type_id_key" ON "Court_Game_Type"("court_id", "game_type_id");

-- CreateIndex
CREATE INDEX "Slot_start_time_idx" ON "Slot"("start_time");

-- CreateIndex
CREATE INDEX "Slot_end_time_idx" ON "Slot"("end_time");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_court_id_start_time_end_time_key" ON "Slot"("court_id", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_slot_id_key" ON "Booking"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_user_id_court_id_key" ON "Review"("user_id", "court_id");

-- AddForeignKey
ALTER TABLE "Court_Game_Type" ADD CONSTRAINT "Court_Game_Type_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court_Game_Type" ADD CONSTRAINT "Court_Game_Type_game_type_id_fkey" FOREIGN KEY ("game_type_id") REFERENCES "Game_Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court_Specs" ADD CONSTRAINT "Court_Specs_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court_Media" ADD CONSTRAINT "Court_Media_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court_Availability" ADD CONSTRAINT "Court_Availability_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court_Close_Dates" ADD CONSTRAINT "Court_Close_Dates_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "Slot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
