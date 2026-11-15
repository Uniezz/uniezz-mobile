export const formatCompactCount = (count: number, locale?: string) =>
  new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(count)
    .toLowerCase();
