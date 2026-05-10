import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

/**
 * Whether the app note board floating window may open without violating modal dialog stack rules.
 */
export function canOpenAppNoteboardFloatingWindow (): boolean {
  return (
    S_DialogMarkdown().markdownDialogOpenCount === 0 &&
    S_DialogComponent().componentDialogOpenCount === 0
  )
}
