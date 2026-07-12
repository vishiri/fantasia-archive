import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'

/**
 * Maps saved document appearance color strings to optional inline chrome styles.
 */
export function resolveFaDocumentAppearanceChromeStyle (input: {
  documentBackgroundColor: string
  documentTextColor: string
}): I_faDocumentAppearanceChromeStyle | undefined {
  const style: I_faDocumentAppearanceChromeStyle = {}
  const textColor = input.documentTextColor.trim()
  const backgroundColor = input.documentBackgroundColor.trim()
  if (textColor.length > 0) {
    style.color = textColor
  }
  if (backgroundColor.length > 0) {
    style.backgroundColor = backgroundColor
  }
  if (style.color === undefined && style.backgroundColor === undefined) {
    return undefined
  }
  return style
}

/**
 * Whether inline chrome styles should override default tab/tree tokens.
 */
export function resolveFaDocumentAppearanceHasCustomChromeStyle (
  chromeStyle: I_faDocumentAppearanceChromeStyle | undefined
): boolean {
  return chromeStyle !== undefined
}
