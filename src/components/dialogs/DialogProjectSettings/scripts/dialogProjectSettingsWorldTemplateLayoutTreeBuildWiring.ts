import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft,
  I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode,
  I_dialogProjectSettingsWorldTemplatePlacementDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import {
  resolveFaProjectWorldTemplateGroupDisplayName
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import {
  buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations,
  resolveFaProjectWorldTemplatePlacementNickname
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'

import {
  DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeData'
import {
  resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabelFromResolved,
  resolveDialogProjectSettingsWorldTemplatePlacementUsesNicknameFromResolved
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeLocalizedLabels'

type T_rootLayoutItem =
  | { kind: 'group', groupId: string, rootSortOrder: number }
  | { kind: 'placement', placementId: string, rootSortOrder: number }

function buildRootLayoutItems (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): T_rootLayoutItem[] {
  const items: T_rootLayoutItem[] = [
    ...layout.groups.map((group) => ({
      groupId: group.id,
      kind: 'group' as const,
      rootSortOrder: group.rootSortOrder
    })),
    ...layout.placements
      .filter((placement) => placement.groupId === null)
      .map((placement) => ({
        kind: 'placement' as const,
        placementId: placement.id,
        rootSortOrder: placement.rootSortOrder ?? 0
      }))
  ]
  items.sort((left, right) => left.rootSortOrder - right.rootSortOrder)
  return items
}

function readPlacementDraftLabelFields (
  placement: I_dialogProjectSettingsWorldTemplatePlacementDraft
): {
    nicknamePluralTranslations: I_dialogProjectSettingsWorldTemplatePlacementDraft['nicknamePluralTranslations']
    nicknameSingularTranslations: I_dialogProjectSettingsWorldTemplatePlacementDraft['nicknameSingularTranslations']
    templateDisplayName: string
  } {
  const nicknamePluralTranslations = placement.nicknamePluralTranslations ?? {}
  const nicknameSingularTranslations = placement.nicknameSingularTranslations ?? {}
  const templateDisplayName = placement.templateDisplayName ??
    (placement as { displayName?: string }).displayName ??
    ''
  return {
    nicknamePluralTranslations,
    nicknameSingularTranslations,
    templateDisplayName
  }
}

function mapPlacementToHeTreeNode (
  placement: I_dialogProjectSettingsWorldTemplatePlacementDraft,
  languageCode: T_faUserSettingsLanguageCode
): I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode {
  const {
    nicknamePluralTranslations,
    nicknameSingularTranslations,
    templateDisplayName
  } = readPlacementDraftLabelFields(placement)
  const resolvedNickname = resolveFaProjectWorldTemplatePlacementNickname(
    buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
      nicknamePluralTranslations,
      nicknameSingularTranslations
    }),
    languageCode
  )
  const usesNickname = resolveDialogProjectSettingsWorldTemplatePlacementUsesNicknameFromResolved({
    resolvedNickname
  })
  const label = resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabelFromResolved({
    resolvedNickname,
    templateDisplayName
  })
  return {
    children: [],
    displayNameTranslations: {},
    documentCountInWorld: placement.documentCountInWorld,
    documentTemplateId: placement.documentTemplateId,
    icon: placement.icon,
    id: placement.id,
    label,
    nicknamePluralTranslations,
    nicknameSingularTranslations,
    nodeKind: 'template',
    templateDisplayName,
    usesNickname,
    worldAppendix: placement.worldAppendix
  }
}

function buildGroupChildNodes (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  groupId: string,
  languageCode: T_faUserSettingsLanguageCode
): I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[] {
  return layout.placements
    .filter((placement) => placement.groupId === groupId)
    .map((placement) => ({
      ...placement,
      groupSortOrder: placement.groupSortOrder ?? 0
    }))
    .sort((left, right) => left.groupSortOrder - right.groupSortOrder)
    .map((placement) => mapPlacementToHeTreeNode(placement, languageCode))
}

export function buildHeTreeNodesFromWorldTemplateLayoutDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  languageCode: T_faUserSettingsLanguageCode
): I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[] {
  const groupById = new Map(layout.groups.map((group) => [group.id, group]))
  const placementById = new Map(layout.placements.map((placement) => [placement.id, placement]))
  const rootItems = buildRootLayoutItems(layout)

  return rootItems.map((item) => {
    if (item.kind === 'group') {
      const group = groupById.get(item.groupId)!
      return {
        children: buildGroupChildNodes(layout, group.id, languageCode),
        displayNameTranslations: group.displayNameTranslations,
        documentCountInWorld: 0,
        documentTemplateId: null,
        icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
        id: group.id,
        label: resolveFaProjectWorldTemplateGroupDisplayName(
          group.displayNameTranslations,
          languageCode
        ),
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        nodeKind: 'group' as const,
        templateDisplayName: '',
        usesNickname: false,
        worldAppendix: ''
      }
    }
    return mapPlacementToHeTreeNode(placementById.get(item.placementId)!, languageCode)
  })
}

function applyPlacementDisplayFieldsToHeTreeNode (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode,
  placement: I_dialogProjectSettingsWorldTemplatePlacementDraft,
  languageCode: T_faUserSettingsLanguageCode
): void {
  const {
    nicknamePluralTranslations,
    nicknameSingularTranslations,
    templateDisplayName
  } = readPlacementDraftLabelFields(placement)
  const resolvedNickname = resolveFaProjectWorldTemplatePlacementNickname(
    buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
      nicknamePluralTranslations,
      nicknameSingularTranslations
    }),
    languageCode
  )
  node.documentCountInWorld = placement.documentCountInWorld
  node.displayNameTranslations = {}
  node.icon = placement.icon
  node.label = resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabelFromResolved({
    resolvedNickname,
    templateDisplayName
  })
  node.nicknamePluralTranslations = nicknamePluralTranslations
  node.nicknameSingularTranslations = nicknameSingularTranslations
  node.templateDisplayName = templateDisplayName
  node.usesNickname = resolveDialogProjectSettingsWorldTemplatePlacementUsesNicknameFromResolved({
    resolvedNickname
  })
  node.worldAppendix = placement.worldAppendix
}

export function patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes (
  treeNodes: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[],
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  languageCode: T_faUserSettingsLanguageCode
): void {
  const groupById = new Map(layout.groups.map((group) => [group.id, group]))
  const placementById = new Map(layout.placements.map((placement) => [placement.id, placement]))

  for (const node of treeNodes) {
    if (node.nodeKind === 'group') {
      const group = groupById.get(node.id)
      if (group === undefined) {
        continue
      }
      node.displayNameTranslations = group.displayNameTranslations
      node.label = resolveFaProjectWorldTemplateGroupDisplayName(
        group.displayNameTranslations,
        languageCode
      )
      for (const child of node.children) {
        const placement = placementById.get(child.id)
        if (placement === undefined) {
          continue
        }
        applyPlacementDisplayFieldsToHeTreeNode(child, placement, languageCode)
      }
      continue
    }
    const placement = placementById.get(node.id)
    if (placement === undefined) {
      continue
    }
    applyPlacementDisplayFieldsToHeTreeNode(node, placement, languageCode)
  }
}

export function resolveDialogProjectSettingsWorldTemplatePlacementUsesNickname (params: {
  languageCode: T_faUserSettingsLanguageCode
  nicknamePluralTranslations: I_dialogProjectSettingsWorldTemplatePlacementDraft['nicknamePluralTranslations']
  nicknameSingularTranslations: I_dialogProjectSettingsWorldTemplatePlacementDraft['nicknameSingularTranslations']
}): boolean {
  const resolvedNickname = resolveFaProjectWorldTemplatePlacementNickname(
    buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
      nicknamePluralTranslations: params.nicknamePluralTranslations,
      nicknameSingularTranslations: params.nicknameSingularTranslations
    }),
    params.languageCode
  )
  return resolveDialogProjectSettingsWorldTemplatePlacementUsesNicknameFromResolved({
    resolvedNickname
  })
}

export function resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabel (params: {
  languageCode: T_faUserSettingsLanguageCode
  nicknamePluralTranslations: I_dialogProjectSettingsWorldTemplatePlacementDraft['nicknamePluralTranslations']
  nicknameSingularTranslations: I_dialogProjectSettingsWorldTemplatePlacementDraft['nicknameSingularTranslations']
  templateDisplayName: string
}): string {
  const resolvedNickname = resolveFaProjectWorldTemplatePlacementNickname(
    buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
      nicknamePluralTranslations: params.nicknamePluralTranslations,
      nicknameSingularTranslations: params.nicknameSingularTranslations
    }),
    params.languageCode
  )
  return resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabelFromResolved({
    resolvedNickname,
    templateDisplayName: params.templateDisplayName
  })
}
