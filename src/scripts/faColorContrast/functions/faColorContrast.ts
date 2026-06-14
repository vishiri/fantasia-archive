import type {
  I_faColorContrastRgb,
  T_faDialogProjectSettingsWorldColorPaletteDuplicateIconColor
} from 'app/types/I_faColorContrast'

function normalizeFaColorContrastHexChannel (value: number): number {
  const channel = value / 255
  if (channel <= 0.03928) {
    return channel / 12.92
  }
  return ((channel + 0.055) / 1.055) ** 2.4
}

/**
 * Parses #RGB or #RRGGBB into sRGB channels. Returns null for invalid input.
 */
export function parseFaColorContrastHexToRgb (hexColor: string): I_faColorContrastRgb | null {
  const trimmed = hexColor.trim()
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed)
  if (match === null) {
    return null
  }
  const raw = match[1]?.toLowerCase() ?? ''
  const expanded = raw.length === 3
    ? raw.split('').map((digit) => `${digit}${digit}`).join('')
    : raw
  const value = Number.parseInt(expanded, 16)
  if (Number.isNaN(value)) {
    return null
  }
  return {
    b: value & 255,
    g: (value >> 8) & 255,
    r: (value >> 16) & 255
  }
}

/**
 * WCAG 2.x relative luminance for an sRGB color.
 */
export function calculateFaColorContrastRelativeLuminance (rgb: I_faColorContrastRgb): number {
  const red = normalizeFaColorContrastHexChannel(rgb.r)
  const green = normalizeFaColorContrastHexChannel(rgb.g)
  const blue = normalizeFaColorContrastHexChannel(rgb.b)
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue)
}

/**
 * WCAG 2.x contrast ratio between two #RRGGBB / #RGB colors (order independent).
 */
export function calculateFaColorContrastRatio (
  foregroundHex: string,
  backgroundHex: string
): number | null {
  const foregroundRgb = parseFaColorContrastHexToRgb(foregroundHex)
  const backgroundRgb = parseFaColorContrastHexToRgb(backgroundHex)
  if (foregroundRgb === null || backgroundRgb === null) {
    return null
  }
  const foregroundLuminance = calculateFaColorContrastRelativeLuminance(foregroundRgb)
  const backgroundLuminance = calculateFaColorContrastRelativeLuminance(backgroundRgb)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Picks negative or black Quasar icon color for a duplicate palette overlay on a swatch fill.
 * Prefers negative when contrast is sufficient; otherwise uses black.
 */
export function resolveFaDuplicatePaletteIconQuasarColor (
  backgroundHex: string,
  negativeHex: string,
  blackHex: string,
  minContrastRatio: number
): T_faDialogProjectSettingsWorldColorPaletteDuplicateIconColor {
  const negativeContrast = calculateFaColorContrastRatio(negativeHex, backgroundHex)
  if (negativeContrast === null || negativeContrast < minContrastRatio) {
    return 'black'
  }
  return 'negative'
}
