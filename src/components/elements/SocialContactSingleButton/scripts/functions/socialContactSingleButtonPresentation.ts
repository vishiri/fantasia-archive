import type { I_socialContactButton } from 'app/types/I_socialContactButtons'

/**
 * Whether the label row should render beside the icon.
 */
export function socialContactSingleButtonShowLabel (label: string): boolean {
  return label.trim().length > 0
}

/**
 * Accessible alt text for the social icon image.
 */
export function socialContactSingleButtonImageAlt (
  label: string,
  title: string
): string {
  const trimmedLabel = label.trim()
  if (trimmedLabel.length > 0) {
    return `${trimmedLabel} icon`
  }

  return title
}

/**
 * Relative public asset path segment for a social button icon file name.
 */
export function socialContactSingleButtonIconRelativePath (iconFileName: string): string {
  return `images/socialContactButtons/${iconFileName}`
}

/**
 * Pass-through for template binding (Playwright passes dataInput via COMPONENT_PROPS).
 */
export function socialContactSingleButtonData (
  dataInput: I_socialContactButton
): I_socialContactButton {
  return dataInput
}
