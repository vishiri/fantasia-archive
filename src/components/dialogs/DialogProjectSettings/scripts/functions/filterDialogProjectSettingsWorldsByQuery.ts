import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

export function filterDialogProjectSettingsWorldsByQuery (
  worlds: I_dialogProjectSettingsWorldDraft[],
  query: string
): I_dialogProjectSettingsWorldDraft[] {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) {
    return worlds
  }

  return worlds.filter((world) => world.displayName.toLowerCase().includes(needle))
}
