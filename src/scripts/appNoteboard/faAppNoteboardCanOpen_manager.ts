import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

import { createFaAppNoteboardCanOpen } from './functions/createFaAppNoteboardCanOpen'

const faAppNoteboardCanOpen = createFaAppNoteboardCanOpen({
  getComponentDialogOpenCount: () => S_DialogComponent().componentDialogOpenCount,
  getMarkdownDialogOpenCount: () => S_DialogMarkdown().markdownDialogOpenCount
})

export const canOpenFloatingWindowWhileNoModal =
  faAppNoteboardCanOpen.canOpenFloatingWindowWhileNoModal
