# API Endpoints (Frontend Reference)

Base URL: `http://localhost:3000` (or your deployed origin). All responses are JSON unless noted.

---

## General

### `GET /`

Health / welcome.

**Response:** `"welcome :)"`

---

### `GET /test`

Simple connectivity check.

**Response:** `"works!"`

---

## Location

Base path: `/api/location`

### `GET /api/location/current-info`

Returns current location info, timezone, and holiday status for a place (e.g. city/region).

**Query parameters**

| Parameter    | Type   | Required | Description                          |
| ------------ | ------ | -------- | ------------------------------------ |
| `searchText` | string | Yes      | Place search (e.g. `"Bali"`, `"Tokyo"`) |

**Success response (200)**

```json
{
  "location": {
    "timezoneId": "Asia/Makassar",
    "administrativeAreaLevel2": "Bali",
    "administrativeAreaLevel1": "Bali",
    "country": "Indonesia",
    "countryCode": "ID"
  },
  "currentUTCOffsetInMinutes": 480,
  "currentTime": { "hour": 14, "minute": 30 },
  "currentDate": { "year": 2025, "month": 2, "day": 28 },
  "timeOfDay": "afternoon",
  "isHoliday": false,
  "holidays": [
    { "holidayName": "Example Holiday", "holidayStatus": "CONFIRMED" }
  ]
}
```

- **`location`** – Place and timezone from search.
- **`currentUTCOffsetInMinutes`** – UTC offset in minutes (positive = ahead of UTC).
- **`currentTime`** – Local time `{ hour, minute }` (24h).
- **`currentDate`** – Local date `{ year, month, day }`.
- **`timeOfDay`** – `"morning"` \| `"afternoon"` \| `"evening"` \| `"night"`.
- **`isHoliday`** – Whether the current date is a holiday in that country.
- **`holidays`** – List of holidays on that date (`holidayStatus`: `"CONFIRMED"` or `"TENTATIVE"`).

**Error responses**

- **400** – Missing `searchText`: `{ "error": "Query parameter 'searchText' is required" }`
- **500** – `{ "error": "Internal server error" }`

---

### `GET /api/location/next-hours`

Returns the next N hours (from the next hour boundary) with time and holiday info for a timezone/country.

**Query parameters**

| Parameter         | Type   | Required | Description                                      |
| ----------------- | ------ | -------- | ------------------------------------------------ |
| `timezoneId`      | string | Yes      | IANA timezone (e.g. `"Asia/Jakarta"`)           |
| `countryCode`     | string | Yes      | ISO country code (e.g. `"ID"`, `"US"`)          |
| `hourReturnCount` | number | No       | Number of hours to return (parsed as integer)   |

**Success response (200)**

```json
{
  "nextHours": [
    {
      "time": { "hour": 15, "minute": 0 },
      "timeOfDay": "afternoon",
      "isHoliday": false,
      "holidays": [],
      "date": { "year": 2025, "month": 2, "day": 28 }
    }
  ]
}
```

- **`nextHours`** – Array of hour slots from the next hour boundary.
- Each slot: **`time`** (local hour/minute), **`timeOfDay`**, **`isHoliday`**, **`holidays`**, **`date`** (local date).

**Error responses**

- **400** – Missing `timezoneId` or `countryCode`: `{ "error": "Query parameters 'timezoneId' and 'countryCode' are required" }`
- **500** – `{ "error": "Internal server error" }`

**Note:** Use `timezoneId` and `countryCode` from `/api/location/current-info` for consistency.

---

## Refresh (admin / internal)

Base path: `/api/refresh`

### `GET /api/refresh/calendar`

Triggers a refresh of holiday calendar data from Google Calendar. Intended for admin/cron use.

**Success response (200)**

```json
{
  "message": "successfuly refreshed data"
}
```

**Error response**

- **500** – `{ "error": "Internal server error" }`

---

## Summary

| Method | Endpoint                         | Purpose                                      |
| ------ | -------------------------------- | -------------------------------------------- |
| GET    | `/`                              | Welcome                                      |
| GET    | `/test`                          | Connectivity check                            |
| GET    | `/api/location/current-info`     | Location + timezone + current holiday        |
| GET    | `/api/location/next-hours`       | Next N hours + holiday per hour              |
| GET    | `/api/refresh/calendar`          | Refresh holiday calendar data (admin)        |
