-- CreateTable
CREATE TABLE "google_holiday_calendar" (
    "id" TEXT NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "calendar_name" VARCHAR NOT NULL,
    "calendar_url" VARCHAR NOT NULL,

    CONSTRAINT "google_holiday_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_holiday_calendar_country_code_key" ON "google_holiday_calendar"("country_code");
