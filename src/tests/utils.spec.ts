import { arrayContainsArray } from "../utils";

describe('utils', () => {
  describe('arrayContainsArray', () => {
    it('returns true if superset contains all items from subset', () => {
      // Arrange
      const superset = [1, 2, 3, 4]
      const subsetA = [2, 1, 4]
      const subsetB = [1]
      const subsetC = [1, 2, 3, 4]

      // Assert
      expect(arrayContainsArray(superset, subsetA)).toBeTruthy()
      expect(arrayContainsArray(superset, subsetB)).toBeTruthy()
      expect(arrayContainsArray(superset, subsetC)).toBeTruthy()
    })

    it('returns false if not', () => {
      // Arrange
      const superset = [1, 2, 3, 4]
      const subsetA = [5, 6, 7]
      const subsetB = [1, 2, 3, 4, 5]
      const subsetC: number[] = []

      // Assert
      expect(arrayContainsArray(superset, subsetA)).toBeFalsy()
      expect(arrayContainsArray(superset, subsetB)).toBeFalsy()
      expect(arrayContainsArray(superset, subsetC)).toBeFalsy()
    })
  })
})