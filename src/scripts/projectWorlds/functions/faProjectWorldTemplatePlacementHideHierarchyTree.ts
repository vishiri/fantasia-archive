/**
 * True when any workspace hierarchy world has ≥1 template placement.
 */
export function hasAnyFaProjectWorldTemplatePlacement (
  worlds: ReadonlyArray<{ readonly placements: ReadonlyArray<unknown> }>
): boolean {
  return worlds.some((world) => world.placements.length > 0)
}

/**
 * True when any Project Settings world draft has ≥1 template placement.
 */
export function hasAnyDialogProjectSettingsWorldTemplatePlacement (
  worlds: ReadonlyArray<{
    readonly templateLayout: { readonly placements: ReadonlyArray<unknown> }
  }>
): boolean {
  return worlds.some((world) => world.templateLayout.placements.length > 0)
}

/**
 * When Project Settings opened with zero world template placements, map saved
 * placement presence to hideHierarchyTree. Returns null when gate does not apply.
 */
export function resolveHideHierarchyTreeAfterEmptyWorldTemplateGate (input: {
  hadPlacementsBeforeDialogOpen: boolean
  hasPlacementsAfterSave: boolean
}): boolean | null {
  if (input.hadPlacementsBeforeDialogOpen) {
    return null
  }
  return !input.hasPlacementsAfterSave
}

/**
 * After project create/open layout refresh: hide hierarchy tree when no world
 * has a template placement. Does not auto-show.
 */
export async function syncHideHierarchyTreeWhenNoWorldTemplatePlacements (input: {
  getHideHierarchyTree: () => boolean
  getWorlds: () => ReadonlyArray<{ readonly placements: ReadonlyArray<unknown> }>
  patchHideHierarchyTree: (hideHierarchyTree: boolean) => Promise<void>
  projectStillCurrent?: () => boolean
  refreshLayout: () => Promise<void>
}): Promise<void> {
  await input.refreshLayout()
  if (input.projectStillCurrent?.() === false) {
    return
  }
  if (hasAnyFaProjectWorldTemplatePlacement(input.getWorlds())) {
    return
  }
  if (input.getHideHierarchyTree()) {
    return
  }
  await input.patchHideHierarchyTree(true)
}
