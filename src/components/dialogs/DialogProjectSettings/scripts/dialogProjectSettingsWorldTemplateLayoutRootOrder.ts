import type { I_dialogProjectSettingsWorldTemplateLayoutDraft } from 'app/types/I_dialogProjectSettingsWorlds'

export function compareDialogProjectSettingsWorldTemplateLayoutGroupSortOrder (
  left: { groupSortOrder: number | null },
  right: { groupSortOrder: number | null }
): number {
  return (left.groupSortOrder ?? 0) - (right.groupSortOrder ?? 0)
}

export function normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const compareGroupSortOrder = compareDialogProjectSettingsWorldTemplateLayoutGroupSortOrder
  const rootGroups = [...layout.groups].sort(
    (left, right) => left.rootSortOrder - right.rootSortOrder
  )
  const rootPlacements = layout.placements
    .filter((placement) => placement.groupId === null)
    .map((placement) => ({
      ...placement,
      rootSortOrder: placement.rootSortOrder ?? 0
    }))
    .sort((left, right) => left.rootSortOrder - right.rootSortOrder)
  const rootGroupOrderById = new Map(
    rootGroups.map((group) => [group.id, group.rootSortOrder] as const)
  )
  const rootPlacementSortOrderById = new Map(
    rootPlacements.map((placement) => [placement.id, placement.rootSortOrder] as const)
  )

  const rootItems: Array<
    | { kind: 'group', id: string }
    | { kind: 'placement', id: string }
  > = [
    ...rootGroups.map((group) => ({
      id: group.id,
      kind: 'group' as const
    })),
    ...rootPlacements.map((placement) => ({
      id: placement.id,
      kind: 'placement' as const
    }))
  ].sort((left, right) => {
    const leftOrder = left.kind === 'group'
      ? rootGroupOrderById.get(left.id)!
      : rootPlacementSortOrderById.get(left.id)!
    const rightOrder = right.kind === 'group'
      ? rootGroupOrderById.get(right.id)!
      : rootPlacementSortOrderById.get(right.id)!
    return leftOrder - rightOrder
  })

  const groupOrderById = new Map<string, number>()
  const rootPlacementOrderById = new Map<string, number>()
  rootItems.forEach((item, index) => {
    if (item.kind === 'group') {
      groupOrderById.set(item.id, index)
      return
    }
    rootPlacementOrderById.set(item.id, index)
  })

  const groupSortByGroupId = new Map<string, Map<string, number>>()
  for (const group of layout.groups) {
    const grouped = layout.placements
      .filter((placement) => placement.groupId === group.id)
      .sort(compareGroupSortOrder)
    const orderMap = new Map<string, number>()
    grouped.forEach((placement, index) => {
      orderMap.set(placement.id, index)
    })
    groupSortByGroupId.set(group.id, orderMap)
  }

  return {
    groups: layout.groups.map((group) => ({
      ...group,
      rootSortOrder: groupOrderById.get(group.id)!
    })),
    placements: layout.placements.map((placement) => {
      if (placement.groupId === null) {
        return {
          ...placement,
          groupSortOrder: null,
          rootSortOrder: rootPlacementOrderById.get(placement.id)!
        }
      }
      const orderMap = groupSortByGroupId.get(placement.groupId)
      return {
        ...placement,
        groupSortOrder: orderMap?.get(placement.id) ?? placement.groupSortOrder,
        rootSortOrder: null
      }
    })
  }
}
