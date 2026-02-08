/*
  Warnings:

  - A unique constraint covering the columns `[calendar_url]` on the table `google_holiday_calendars` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `last_updated` to the `google_holiday_calendars` table without a default value. This is not possible if the table is not empty.
  - Added the required column `next_sync_token` to the `google_holiday_calendars` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('CONFIRMED', 'TENTATIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "google_holiday_calendars" ADD COLUMN     "last_updated" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "next_sync_token" VARCHAR NOT NULL;

-- CreateTable
CREATE TABLE "google_holiday_events" (
    "id" TEXT NOT NULL,
    "google_id" TEXT NOT NULL,
    "calendar_id" TEXT NOT NULL,
    "holiday_name" VARCHAR NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'CONFIRMED',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,

    CONSTRAINT "google_holiday_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_holiday_events_google_id_key" ON "google_holiday_events"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_holiday_calendars_calendar_url_key" ON "google_holiday_calendars"("calendar_url");

-- AddForeignKey
ALTER TABLE "google_holiday_events" ADD CONSTRAINT "google_holiday_events_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "google_holiday_calendars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
