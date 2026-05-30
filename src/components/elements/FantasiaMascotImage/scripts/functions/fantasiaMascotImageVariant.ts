/**
 * True when the mascot URL is chosen at random (empty fantasiaImage prop).
 */
export function fantasiaMascotImageIsRandom (fantasiaImage: string): boolean {
  return fantasiaImage === ''
}

/**
 * Display name for data-test-image metadata (prop value or random).
 */
export function fantasiaMascotVariantName (fantasiaImage: string): string {
  if (fantasiaImage.length > 0) {
    return fantasiaImage
  }

  return 'random'
}
