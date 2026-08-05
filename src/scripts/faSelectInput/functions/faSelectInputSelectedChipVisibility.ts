import type { T_faSelectInputOption } from 'app/types/I_faSelectInput'

/**
 * Whether selected-item slot should render a chip.
 * Empty single simple (`''`) and null object selection stay chip-less.
 */
export function shouldShowFaSelectInputSelectedChip (
  opt: T_faSelectInputOption | null | undefined
): boolean {
  if (opt === null || opt === undefined) {
    return false
  }

  if (typeof opt === 'string') {
    return opt.length > 0
  }

  if (typeof opt !== 'object' || Array.isArray(opt)) {
    return false
  }

  if (!('name' in opt) || typeof opt.name !== 'string') {
    return false
  }

  return opt.name.trim().length > 0
}
