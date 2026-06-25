import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

/**
 * First world id when the list is non-empty; otherwise null.
 */
export function resolveDialogProjectSettingsInitialWorldId (
  worlds: I_dialogProjectSettingsWorldDraft[]
): string | null {
  return worlds[0]?.id ?? null
}

/**
 * True when selectedWorldId is missing or not present in worlds.
 */
export function isDialogProjectSettingsWorldSelectionInvalid (
  worlds: I_dialogProjectSettingsWorldDraft[],
  selectedWorldId: string | null
): boolean {
  if (selectedWorldId === null) {
    return true
  }
  return !worlds.some((world) => world.id === selectedWorldId)
}

/**
 * After a world is removed, prefer the row at the same index, else the previous row.
 */
export function resolveDialogProjectSettingsWorldIdAfterRemove (
  worldsAfterRemove: I_dialogProjectSettingsWorldDraft[],
  removedId: string,
  previousSelectedId: string | null,
  worldsBeforeRemove: I_dialogProjectSettingsWorldDraft[]
): string | null {
  if (worldsAfterRemove.length === 0) {
    return null
  }
  if (previousSelectedId !== removedId) {
    if (worldsAfterRemove.some((world) => world.id === previousSelectedId)) {
      return previousSelectedId
    }
    return resolveDialogProjectSettingsInitialWorldId(worldsAfterRemove)
  }
  const removedIndex = worldsBeforeRemove.findIndex((world) => world.id === removedId)
  if (removedIndex < 0) {
    return resolveDialogProjectSettingsInitialWorldId(worldsAfterRemove)
  }
  if (removedIndex < worldsAfterRemove.length) {
    return worldsAfterRemove[removedIndex]!.id
  }
  return worldsAfterRemove[removedIndex - 1]?.id ??
    resolveDialogProjectSettingsInitialWorldId(worldsAfterRemove)
}

/**
 * When a world is appended at the end, returns its id if it was not in the previous list.
 */
export function findDialogProjectSettingsNewlyAppendedWorldId (
  previousWorlds: I_dialogProjectSettingsWorldDraft[],
  nextWorlds: I_dialogProjectSettingsWorldDraft[]
): string | null {
  const previousIds = new Set(previousWorlds.map((world) => world.id))
  const newWorlds = nextWorlds.filter((world) => !previousIds.has(world.id))
  if (newWorlds.length !== 1) {
    return null
  }
  const appendedWorld = newWorlds[0]!
  const lastWorld = nextWorlds[nextWorlds.length - 1]
  if (lastWorld?.id !== appendedWorld.id) {
    return null
  }
  return appendedWorld.id
}

/**
 * Resolves selectedWorldId after the worlds draft list changes.
 */
export function resolveDialogProjectSettingsWorldsPanelSelection (
  nextWorlds: I_dialogProjectSettingsWorldDraft[],
  previousWorlds: I_dialogProjectSettingsWorldDraft[],
  selectedWorldId: string | null
): string | null {
  const appendedId = findDialogProjectSettingsNewlyAppendedWorldId(previousWorlds, nextWorlds)
  if (appendedId !== null) {
    return appendedId
  }

  if (nextWorlds.length < previousWorlds.length) {
    const removedWorld = previousWorlds.find((world) => {
      return !nextWorlds.some((candidate) => candidate.id === world.id)
    }) as I_dialogProjectSettingsWorldDraft
    return resolveDialogProjectSettingsWorldIdAfterRemove(
      nextWorlds,
      removedWorld.id,
      selectedWorldId,
      previousWorlds
    )
  }

  if (isDialogProjectSettingsWorldSelectionInvalid(nextWorlds, selectedWorldId)) {
    return resolveDialogProjectSettingsInitialWorldId(nextWorlds)
  }

  return selectedWorldId
}
