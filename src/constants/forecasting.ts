export const FORECAST_DAYS = 7;
export const HISTORY_DAYS = 28;

export const FORECAST_WEIGHTS = [1, 2, 3, 4];

export const MIN_TREND_FACTOR = 0.85;
export const MAX_TREND_FACTOR = 1.15;

export const DEFAULT_FORECAST_SETTINGS = {
  safetyBufferPercent: 10,
  useTrend: true,
};

export const WEEKDAY_MULTIPLIERS = [
  0.9, // Sunday
  0.8, // Monday
  0.85, // Tuesday
  0.95, // Wednesday
  1.05, // Thursday
  1.35, // Friday
  1.5, // Saturday
];

export const FORECAST_COLORS = {
  historical: "#94a3b8",
  forecast: "#15803d",
};
