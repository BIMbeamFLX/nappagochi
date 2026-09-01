export function appearanceForSettings<T>(committed: T, pending: T | null): T {
  return pending ?? committed;
}
