/**
 * Maps menu specialColor values to template classes that respect Fantasia --fa-color-* tokens.
 * Quasar Material text-grey is avoided; grey menu rows use a BEM modifier styled via fa-v('grey').
 */
export function resolveAppControlMenuItemColorClasses (
  specialColor: string | undefined
): string[] {
  if (specialColor === undefined) {
    return []
  }
  if (specialColor === 'grey') {
    return ['appControlSingleMenu__item--muted']
  }
  return [`text-${specialColor}`]
}
