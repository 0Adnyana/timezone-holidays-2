/*
  Warnings:

  - You are about to drop the `google_holiday_calendar` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "google_holiday_calendar";

-- CreateTable
CREATE TABLE "google_holiday_calendars" (
    "id" TEXT NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "calendar_name" VARCHAR NOT NULL,
    "calendar_url" VARCHAR NOT NULL,

    CONSTRAINT "google_holiday_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_holiday_calendars_country_code_key" ON "google_holiday_calendars"("country_code");
