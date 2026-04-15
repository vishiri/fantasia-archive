import { expect, test, vi } from 'vitest'
import { determineCurrentImage, randomMascotImage } from '../fantasiaMascotImageManagement'

const mockImageList = {
  one: 'img-1.png',
  two: 'img-2.png'
}

/**
 * randomMascotImage
 * Test deterministic random selection.
 */
test('Test that randomMascotImage returns a random value from list', () => {
  vi.spyOn(Math, 'random').mockReturnValueOnce(0)
  expect(randomMascotImage(mockImageList)).toBe('img-1.png')
})

/**
 * determineCurrentImage
 * Test non-random branch uses explicit id.
 */
test('Test that determineCurrentImage returns selected id when not random', () => {
  expect(determineCurrentImage(mockImageList, false, 'two')).toBe('img-2.png')
})

/**
 * determineCurrentImage
 * Test random branch delegates to random selector.
 */
test('Test that determineCurrentImage uses random path when random is enabled', () => {
  vi.spyOn(Math, 'random').mockReturnValueOnce(0)
  expect(determineCurrentImage(mockImageList, true, 'two')).toBe('img-1.png')
})

/**
 * randomMascotImage
 * A random value near one selects the last key when the object has more than one entry.
 */
test('Test that randomMascotImage can return the second list entry for a high random value', () => {
  vi.spyOn(Math, 'random').mockReturnValueOnce(0.99)
  expect(randomMascotImage(mockImageList)).toBe('img-2.png')
})

/**
 * determineCurrentImage
 * Unknown ids read as undefined from the lookup table without throwing.
 */
test('Test that determineCurrentImage returns undefined when the id is not in the list', () => {
  expect(determineCurrentImage(mockImageList, false, 'missing')).toBeUndefined()
})

/**
 * randomMascotImage
 * An empty image map yields undefined because no keys exist to index.
 */
test('Test that randomMascotImage returns undefined for an empty list object', () => {
  expect(randomMascotImage({})).toBeUndefined()
})
