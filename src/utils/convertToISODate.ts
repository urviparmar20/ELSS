export const convertToISODate = (date?: string) => {
  if (!date) return new Date().toISOString().split("T")[0];

  // already yyyy-mm-dd
  if (date.includes("-")) return date;

  const [day, month, year] = date.split("/");

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};