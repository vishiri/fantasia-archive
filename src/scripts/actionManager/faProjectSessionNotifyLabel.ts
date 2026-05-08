import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

/**
 * Builds the short label used in project session success notifications (prefer stored display name,
 * otherwise derive from the selected '.faproject' path leaf).
 */
export function formatFaActiveProjectNotifyLabel (snap: I_faActiveProject | null): string {
  if (snap === null) {
    return ''
  }
  const trimmedName = snap.name.trim()
  if (trimmedName.length > 0) {
    return trimmedName
  }
  const fp = snap.filePath.trim()
  if (fp.length === 0) {
    return ''
  }
  const match = /[/\\]([^/\\]+)$/.exec(fp)
  const leaf = match?.[1] ?? fp
  return leaf.replace(/\.faproject$/i, '')
}
