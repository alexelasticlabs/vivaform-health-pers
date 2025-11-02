export const getDayRange = (input?: string | Date) => {
  const baseDate = input ? new Date(input) : new Date();
  if (Number.isNaN(baseDate.getTime())) {
    throw new Error("Некорректная дата");
  }

  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};