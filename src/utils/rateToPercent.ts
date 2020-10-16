export const rateToPercent = (rate: number): string => {
  return `${Math.round(100 * rate)}%`;
};
