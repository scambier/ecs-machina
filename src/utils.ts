/**
 * Returns TRUE if the first specified array contains all elements
 * from the second one. FALSE otherwise.
 */
export function arrayContainsArray<T>(superset: T[], subset: T[]): boolean {
  if (subset.length === 0) {
    return false
  }
  return subset.every((value) => {
    return (superset.indexOf(value) >= 0)
  })
}

export function hashToMap<T>(obj: { [key: string]: T }): Map<string, T> {
  const map = new Map<string, T>()
  for (const [key, value] of Object.entries(obj)) {
    map.set(key, value)
  }
  return map
}

export function mapToHash<T>(map: Map<string, T>): { [key: string]: T } {
  const obj: { [key: string]: T } = {}
  map.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}
