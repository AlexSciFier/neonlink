export function addDays(date, days) {
  date = new Date(date).setDate(date.getDate() + days);
  return date;
}
