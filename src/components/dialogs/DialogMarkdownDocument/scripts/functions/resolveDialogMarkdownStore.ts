import type { I_dialogMarkdownStoreLike } from 'app/types/I_dialogMarkdownStoreLike'

export function resolveDialogMarkdownStore (
  getStore: () => I_dialogMarkdownStoreLike
): I_dialogMarkdownStoreLike | null {
  try {
    return getStore()
  } catch {
    return null
  }
}
