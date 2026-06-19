export function formatBookingRange(startTime: string, durationMin: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const end = h * 60 + m + durationMin;
  const eh = String(Math.floor(end / 60) % 24).padStart(2, "0");
  const em = String(end % 60).padStart(2, "0");
  return `${startTime}–${eh}:${em}`;
}
