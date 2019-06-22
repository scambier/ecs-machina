/**
 * Returns TRUE if the first specified array contains all elements
 * from the second one. FALSE otherwise.
 */
export function arrayContainsArray<T>(superset: T[], subset: T[]): boolean {
  if (0 === subset.length) {
    return false
  }
  return subset.every((value) => {
    return (superset.indexOf(value) >= 0)
  })
}
