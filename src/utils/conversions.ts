export function metresToNauticalMiles(x?: number | null) {
  return (x || 0) / 1852;
}

export function nauticalMilesToMeters(x: number) {
  return x * 1852;
}
