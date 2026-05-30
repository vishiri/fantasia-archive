interface I_dialogMarkdownStoreLike {
  dialogUUID?: unknown
  documentToOpen?: unknown
}

export function resolveDialogMarkdownStore (
  getStore: () => I_dialogMarkdownStoreLike
): I_dialogMarkdownStoreLike | null {
  try {
    return getStore()
  } catch {
    return null
  }
}
