import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft,
  I_dialogProjectSettingsWorldTemplatePlacementDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldTemplateLayoutForProjectSettings } from 'app/types/I_faProjectWorldTemplateLayoutDomain'
import type { I_faProjectWorldTemplateLayoutSnapshot } from 'app/types/I_faProjectWorldTemplateLayoutDomain'

import {
  compareDialogProjectSettingsWorldTemplateLayoutGroupSortOrder,
  normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder
} from './dialogProjectSettingsWorldTemplateLayoutRootOrder'

export function createEmptyDialogProjectSettingsWorldTemplateLayoutDraft (
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  return {
    groups: [],
    placements: []
  }
}

export function mapDialogProjectSettingsWorldTemplateLayoutFromApi (
  layout: I_faProjectWorldTemplateLayoutForProjectSettings
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  return {
    groups: layout.groups.map((group) => ({
      displayName: group.displayName,
      id: group.id,
      rootSortOrder: group.rootSortOrder
    })),
    placements: layout.placements.map((placement) => ({
      documentCountInWorld: placement.documentCountInWorld,
      documentTemplateId: placement.documentTemplateId,
      groupId: placement.groupId,
      groupSortOrder: placement.groupSortOrder,
      icon: placement.icon,
      id: placement.id,
      nickname: placement.nickname,
      rootSortOrder: placement.rootSortOrder,
      templateDisplayName: placement.displayName,
      worldAppendix: placement.worldAppendix
    }))
  }
}

export function mapDialogProjectSettingsWorldTemplateLayoutToSnapshot (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): I_faProjectWorldTemplateLayoutSnapshot {
  return {
    groups: layout.groups.map((group) => ({
      displayName: group.displayName.trim(),
      id: group.id,
      rootSortOrder: group.rootSortOrder
    })),
    placements: layout.placements.map((placement) => ({
      documentTemplateId: placement.documentTemplateId,
      groupId: placement.groupId,
      groupSortOrder: placement.groupSortOrder,
      id: placement.id,
      nickname: placement.nickname.trim(),
      rootSortOrder: placement.rootSortOrder
    }))
  }
}

export function appendDialogProjectSettingsWorldTemplateGroupDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  defaultDisplayName: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const nextRootOrder = layout.groups.length + layout.placements.filter(
    (placement) => placement.groupId === null
  ).length
  return normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder({
    groups: [
      ...layout.groups,
      {
        displayName: defaultDisplayName,
        id: crypto.randomUUID(),
        rootSortOrder: nextRootOrder
      }
    ],
    placements: layout.placements
  })
}

export function renameDialogProjectSettingsWorldTemplateGroupDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  groupId: string,
  displayName: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  return {
    groups: layout.groups.map((group) => {
      if (group.id !== groupId) {
        return group
      }
      return {
        ...group,
        displayName
      }
    }),
    placements: layout.placements
  }
}

export function renameDialogProjectSettingsWorldTemplatePlacementNicknameDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  placementId: string,
  nickname: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  return {
    groups: layout.groups,
    placements: layout.placements.map((placement) => {
      if (placement.id !== placementId) {
        return placement
      }
      return {
        ...placement,
        nickname
      }
    })
  }
}

export function syncDialogProjectSettingsWorldTemplatePlacementTemplateDisplayNames (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  documentTemplateId: string,
  templateDisplayName: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  return {
    groups: layout.groups,
    placements: layout.placements.map((placement) => {
      if (placement.documentTemplateId !== documentTemplateId) {
        return placement
      }
      return {
        ...placement,
        templateDisplayName
      }
    })
  }
}

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

export function appendDialogProjectSettingsWorldTemplatePlacementDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  template: {
    documentTemplateId: string
    icon: string
    templateDisplayName: string
    worldAppendix: string
  }
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const rootCount = layout.groups.length + layout.placements.filter(
    (placement) => placement.groupId === null
  ).length
  return normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder({
    groups: layout.groups,
    placements: [
      ...layout.placements,
      {
        documentCountInWorld: 0,
        documentTemplateId: template.documentTemplateId,
        groupId: null,
        groupSortOrder: null,
        icon: template.icon,
        id: crypto.randomUUID(),
        nickname: '',
        rootSortOrder: rootCount,
        templateDisplayName: template.templateDisplayName,
        worldAppendix: template.worldAppendix
      }
    ]
  })
}

export function removeDialogProjectSettingsWorldTemplatePlacementDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  placementId: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  return normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder({
    groups: layout.groups,
    placements: layout.placements.filter((placement) => placement.id !== placementId)
  })
}

export function hasDialogProjectSettingsWorldTemplateGroupNameValidationError (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): boolean {
  return layout.groups.some((group) => group.displayName.trim().length === 0)
}
