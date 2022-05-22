export function getPastTime(days?: number, hours?: number): string {
  const now = new Date();
  if (days != null) {
    now.setUTCDate(now.getUTCDate() - days);
  }
  if (hours != null) {
    now.setUTCHours(now.getUTCHours() - hours);
  }
  return now.toISOString();
}
