/**
 * Format an event date or date range for display.
 *
 * Single day:        "27 June 2026"
 * Same month + year: "27–28 June 2026"
 * Same year:         "30 June – 1 July 2026"
 * Different years:   "27 June 2026 – 1 July 2027"
 */
export function formatEventDate(start: Date | string, end?: Date | string): string {
  const startDate = new Date(start);

  if (!end) {
    return formatFullDate(startDate);
  }

  const endDate = new Date(end);

  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();

  if (sameMonth) {
    // "27–28 June 2026"
    const month = startDate.toLocaleDateString("en", { month: "long" });
    return `${startDate.getDate()}–${endDate.getDate()} ${month} ${startDate.getFullYear()}`;
  }

  if (sameYear) {
    // "30 June – 1 July 2026"
    const startPart = startDate.toLocaleDateString("en", {
      day: "numeric",
      month: "long",
    });
    const endPart = endDate.toLocaleDateString("en", {
      day: "numeric",
      month: "long",
    });
    return `${startPart} – ${endPart} ${startDate.getFullYear()}`;
  }

  // "27 June 2026 – 1 July 2027"
  return `${formatFullDate(startDate)} – ${formatFullDate(endDate)}`;
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
