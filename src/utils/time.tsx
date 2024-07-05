export function getCurrentDateTime(): string {
  const now = new Date();

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  };

  return now.toLocaleString("en-US", options);
}
