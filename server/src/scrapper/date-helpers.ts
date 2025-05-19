export function formatTodayForConstructor(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split("-");
    return `${parseInt(d, 10)}.${parseInt(m, 10)}.${y}`;
  }
  return date;
}

export function getNextDay(date: string): string {
  let nextDate;
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const origDate = new Date(date);
    nextDate = new Date(origDate.getTime() + 24 * 60 * 60 * 1000);
  } else {
    const parts = date.split(".");
    if (parts.length >= 3) {
      nextDate = new Date(
        `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
      );
      nextDate = new Date(nextDate.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  if (!nextDate) return date;
  return `${nextDate.getDate()}.${
    nextDate.getMonth() + 1
  }.${nextDate.getFullYear()}`;
}
