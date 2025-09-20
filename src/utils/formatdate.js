// formatDate.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Set default timezone
const IST = "Asia/Kolkata";
const UTC = "UTC";

// Format date to DD-MM-YYYY or with time
export function formatDate(value, withTime = false) {
  if (!value) return "";
  const d = dayjs(value);
  if (!d.isValid()) return "";
  return withTime ? d.format("HH:mm DD-MM-YYYY") : d.format("DD-MM-YYYY");
}

// Normalize date to ISO or YYYY-MM-DD
export function normalizeDate(value, withTime = false) {
  if (!value) return "";
  const d = dayjs(value);
  if (!d.isValid()) return "";
  return withTime ? d.toISOString() : d.format("YYYY-MM-DD");
}

// Merge a date and time string
export function mergeDateTime(date, time) {
  const [day, month, year] = date.split("-").map(Number);

  let [startTime] = time.split("-");
  const match = startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);
  if (!match) throw new Error("Invalid time format");

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridian = match[3].toUpperCase();

  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  const datePart = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;

  return `${datePart} ${String(hours).padStart(2, "0")}:${minutes}:00`;
}

// Convert IST date to UTC
export function istToUtc(value) {
  if (!value) return "";
  const d = dayjs.tz(value, IST);
  return d.isValid() ? d.tz(UTC).format() : "";
}

// Convert UTC date to IST
export function utcToIst(value) {
  if (!value) return "";
  const d = dayjs.utc(value).tz("Asia/Kolkata");
  return d.isValid() ? d.format("HH:mm:ss DD-MM-YYYY") : "";
}

// Format IST date in various formats
export function formatIstDate(value, format = "DD-MM-YYYY HH:mm:ss") {
  if (!value) return "";
  const d = dayjs.tz(value, IST);
  return d.isValid() ? d.format(format) : "";
}

// Merge two date strings (start and end)
export function mergeDates(start, end, separator = "to") {
  if (!start || !end) return "";
  const d1 = dayjs(start);
  const d2 = dayjs(end);
  if (!d1.isValid() || !d2.isValid()) return "";
  return `${d1.format("DD-MM-YYYY")} ${separator} ${d2.format("DD-MM-YYYY")}`;
}

// Get relative time (e.g., "5 minutes ago")
export function relativeTimeFromNow(value) {
  if (!value) return "";
  const d = dayjs(value);
  return d.isValid() ? d.fromNow() : "";
}

// Get only the date from a timestamp (UTC or IST)
export function extractDate(
  value,
  timezone = "Asia/Kolkata",
  format = "DD-MM-YYYY"
) {
  if (!value) return "";
  const d = dayjs.tz(value, timezone);
  return d.isValid() ? d.format(format) : "";
}

// Get time from date string (UTC or IST)
export function extractTime(
  value,
  timezone = "Asia/Kolkata",
  format = "HH:mm"
) {
  if (!value) return "";
  const d = dayjs.tz(value, timezone);
  return d.isValid() ? d.format(format) : "";
}

// accept any date and return dd-mm-yyyy hh:mm AM/PM  or dd-mm-yyyy
export function formatAnyDate(dateInput, withTime = false) {
  try {
    // Convert to Date object
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date input");
    }

    // Get India time using toLocaleString
    const options = withTime
      ? {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      : {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };

    const formatted = new Intl.DateTimeFormat("en-GB", options).format(date);

    // Remove commas if present (e.g., "12/08/2025, 10:15 AM" → "12-08-2025 10:15 AM")
    return formatted.replace(/\//g, "-").replace(",", "");
  } catch (error) {
    console.error("Error formatting date:", error);
    return null;
  }
}

// accept "dd-mm-yyyy" and return "Aug 12"
export function formatDateForUser(dateStr) {
  if (!dateStr) return;
  // Convert "dd-mm-yyyy" to Date (IST)
  const [day, month, year] = dateStr.split("-").map(Number);

  // Create date in Indian timezone
  const date = new Date(Date.UTC(year, month - 1, day));

  // Format: "Aug 12"
  return date
    .toLocaleDateString("en-IN", {
      month: "short",
      day: "2-digit",
      timeZone: "Asia/Kolkata",
    })
    .replace(",", ""); // Remove comma
}
