import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

/**
 * Whether a floating window may open while no modal dialog is blocking the stack.
 */
export function canOpenFloatingWindowWhileNoModal (): boolean {
  return (
    S_DialogMarkdown().markdownDialogOpenCount === 0 &&
    S_DialogComponent().componentDialogOpenCount === 0
  )
}
