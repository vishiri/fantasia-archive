import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft,
  I_dialogProjectSettingsWorldTemplatePlacementDraft
} from 'app/types/I_dialogProjectSettingsWorlds'

import {
  compareDialogProjectSettingsWorldTemplateLayoutGroupSortOrder,
  normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder
} from './dialogProjectSettingsWorldTemplateLayoutRootOrder'

export function removeDialogProjectSettingsWorldTemplateGroupDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  groupId: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const removedGroup = layout.groups.find((group) => group.id === groupId)
  if (removedGroup === undefined) {
    return layout
  }
  const groupRootOrder = removedGroup.rootSortOrder
  const groupedChildren = layout.placements
    .filter((placement) => placement.groupId === groupId)
    .sort(compareDialogProjectSettingsWorldTemplateLayoutGroupSortOrder)
  const childCount = groupedChildren.length
  const rootOrderShiftAfterGroup = childCount - 1

  const nextGroups = layout.groups
    .filter((group) => group.id !== groupId)
    .map((group) => {
      if (group.rootSortOrder > groupRootOrder) {
        return {
          ...group,
          rootSortOrder: group.rootSortOrder + rootOrderShiftAfterGroup
        }
      }
      return group
    })

  let childIndex = 0
  const nextPlacements = layout.placements.map((placement) => {
    if (placement.groupId === groupId) {
      const nextPlacement: I_dialogProjectSettingsWorldTemplatePlacementDraft = {
        ...placement,
        groupId: null,
        groupSortOrder: null,
        rootSortOrder: groupRootOrder + childIndex
      }
      childIndex += 1
      return nextPlacement
    }
    if (placement.groupId === null && (placement.rootSortOrder ?? 0) > groupRootOrder) {
      return {
        ...placement,
        groupSortOrder: null,
        rootSortOrder: (placement.rootSortOrder ?? 0) + rootOrderShiftAfterGroup
      }
    }
    return placement
  })

  return normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder({
    groups: nextGroups,
    placements: nextPlacements
  })
}
