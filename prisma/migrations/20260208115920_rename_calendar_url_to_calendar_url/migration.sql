-- AlterTable
ALTER TABLE "google_holiday_calendars" ALTER COLUMN "last_updated" DROP NOT NULL,
ALTER COLUMN "next_sync_token" DROP NOT NULL;
