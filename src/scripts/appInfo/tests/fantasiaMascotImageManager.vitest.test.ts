import { expect, test, vi } from 'vitest'
import { determineCurrentImage, randomMascotImage } from '../fantasiaMascotImageManager'

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
