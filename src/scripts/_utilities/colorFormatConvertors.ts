/**
 * Converts an rgb() or rgba()-style color string to a hex color string.
 * Only the first three numeric channels are used so alpha segments from rgba() are ignored.
 * @param color - RGB or RGBA string (for example a value from 'getComputedStyle().color')
 * @returns Hex color string
 */
export function rgbToHex (color: string) {
  const colorStringRegexMatch = color.match(/\d+/g)
  if (colorStringRegexMatch !== null && colorStringRegexMatch.length >= 3) {
    const rgbChannels = colorStringRegexMatch.slice(0, 3)
    const colorString = rgbChannels.map(function (x) {
      const hex = parseInt(x, 10).toString(16)
      return (hex.length === 1) ? '0' + hex : hex
    }).join('')
    return '#' + colorString
  }
  return false
}

/**
 * Converts a hex color string to RGB string
 * @param color - Hex color string
 * @returns RGB string
 */
export function hexToRgb (hex: string) {
  const normalized = hex.trim().replace(/^#/, '')
  const bigint = parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return r + ',' + g + ',' + b
}
