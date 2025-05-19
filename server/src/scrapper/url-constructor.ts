export function encodeCp(text: string) {
  return encodeURIComponent(text);
}

export function formatDateForCp(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split("-");
    return `${parseInt(d, 10)}.${parseInt(m, 10)}.${y}`;
  }
  return date;
}

export function buildCpSmartLink({
  from,
  to,
  date,
  time,
}: {
  from: string;
  to: string;
  date: string;
  time: string;
}): string {
  const baseUrl = "https://www.cp.sk/vlakbus/spojenie/vysledky/";
  const params = [
    `f=${encodeCp(from)}`,
    `t=${encodeCp(to)}`,
    date ? `date=${formatDateForCp(date)}` : null,
    time ? `time=${time}` : null,
    "submit=true",
  ]
    .filter(Boolean)
    .join("&");
  return `${baseUrl}?${params}`;
}
