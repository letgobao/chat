const units = [
  { unit: "year", milliseconds: 31_536_000_000 },
  { unit: "month", milliseconds: 2_592_000_000 },
  { unit: "week", milliseconds: 604_800_000 },
  { unit: "day", milliseconds: 86_400_000 },
  { unit: "hour", milliseconds: 3_600_000 },
] as const;

export const timeAgo = (pastDate: any): string => {
  const diffInMilliseconds =
    new Date().getTime() - new Date(pastDate).getTime();
  for (let i = 0; i < units.length; i++) {
    const diff = Math.floor(
      diffInMilliseconds / units[i].milliseconds
    );
    if (diff > 0)
      return `${diff} ${units[i].unit}${
        diff > 1 ? "s" : ""
      } ago`;
  }

  return "now";
};

export function getParams(
  source: URLSearchParams,
  ...keys: string[]
) {
  const result: Record<string, any> = {};
  keys.forEach((key) => {
    result[key] = source.get(key);
  });

  return result;
}
