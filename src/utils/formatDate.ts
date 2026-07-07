export const formatDate = (dateStr: string) => {
  if (!dateStr) return "";

  let date: Date;

  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/");
    date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};