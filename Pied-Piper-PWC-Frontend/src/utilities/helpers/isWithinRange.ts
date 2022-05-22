export default function isWithinRange(value: number, minValue: number, maxValue: number): boolean {
  return value >= minValue && value <= maxValue;
}
