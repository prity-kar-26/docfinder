// Safely parses a "YYYY-MM-DD" string as a calendar date with NO time-of-day
// ambiguity — avoids the UTC-midnight trap that `new Date(dateString)` causes.
export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}