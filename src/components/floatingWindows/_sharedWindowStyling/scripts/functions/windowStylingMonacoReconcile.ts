import type { I_faMonacoEditorValueSync } from 'app/types/I_faWindowStylingMonaco'

/**
 * Aligns a mounted editor with the in-memory working CSS when they diverge after async mount.
 */
export function reconcileMountedMonacoWithWorkingCss (opts: {
  editor: I_faMonacoEditorValueSync | null
  workingCss: string
}): void {
  if (opts.editor === null) {
    return
  }
  if (opts.editor.getValue() !== opts.workingCss) {
    opts.editor.setValue(opts.workingCss)
  }
}
