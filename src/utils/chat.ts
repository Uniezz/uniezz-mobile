const DAY = 24 * 60 * 60 * 1000;

// conversation list time: clock time today, weekday this week, date before that
export const chatTime = (
  updatedAt: number,
  locale: string,
  now = Date.now(),
) => {
  const date = new Date(updatedAt);
  const today = new Date(now).toDateString() === date.toDateString();
  return new Intl.DateTimeFormat(
    locale,
    today
      ? { hour: "2-digit", minute: "2-digit" }
      : now - updatedAt < 6 * DAY
        ? { weekday: "short" }
        : { month: "short", day: "numeric" },
  ).format(date);
};

export const isSameDay = (a: number, b: number) =>
  new Date(a).toDateString() === new Date(b).toDateString();

// thread day separator: `todayLabel` for today, otherwise the date
export const chatDay = (
  createdAt: number,
  locale: string,
  todayLabel: string,
  now = Date.now(),
) =>
  isSameDay(createdAt, now)
    ? todayLabel
    : new Intl.DateTimeFormat(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(createdAt);
