import type { I_faProjectWorldTemplateLayoutForProjectSettings } from 'app/types/I_faProjectWorldTemplateLayoutDomain'
import type {
  I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode,
  I_dialogProjectSettingsWorldTemplatePlacementDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import { expect, test } from 'vitest'

import {
  appendDialogProjectSettingsWorldTemplateGroupDraft,
  appendDialogProjectSettingsWorldTemplatePlacementDraft,
  createEmptyDialogProjectSettingsWorldTemplateLayoutDraft,
  hasDialogProjectSettingsWorldTemplateGroupNameValidationError,
  mapDialogProjectSettingsWorldTemplateLayoutFromApi,
  mapDialogProjectSettingsWorldTemplateLayoutToSnapshot,
  removeDialogProjectSettingsWorldTemplateGroupDraft,
  removeDialogProjectSettingsWorldTemplatePlacementDraft,
  renameDialogProjectSettingsWorldTemplateGroupDisplayNameTranslationsDraft,
  renameDialogProjectSettingsWorldTemplatePlacementNicknameTranslationsDraft
} from '../../dialogProjectSettingsWorldTemplateLayoutDraft'
import {
  buildHeTreeNodesFromWorldTemplateLayoutDraft,
  patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes,
  resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabel,
  resolveDialogProjectSettingsWorldTemplatePlacementUsesNickname
} from '../../dialogProjectSettingsWorldTemplateLayoutTreeBuildWiring'
import {
  DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
  isDialogProjectSettingsWorldTemplateLayoutPersistedId,
  mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeScrollContainer
} from '../dialogProjectSettingsWorldTemplateLayoutTreeData'
import {
  mapHeTreeNodesToWorldTemplateLayoutDraft,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeIndex
} from '../dialogProjectSettingsWorldTemplateLayoutTreeReverseMap'
import {
  hasDialogProjectSettingsWorldTemplateLayoutGroupedToRootRegression
} from '../dialogProjectSettingsWorldTemplateLayoutTreeRegression'
import {
  findDialogProjectSettingsWorldTemplateLayoutTreeTemplatePlacement,
  shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit
} from '../../dialogProjectSettingsWorldTemplateLayoutTreeEmitGuard'
import {
  mergeOrphanPlacementsFromPriorWorldTemplateLayout
} from '../dialogProjectSettingsWorldTemplateLayoutOrphanPlacements'
import {
  isDialogProjectSettingsWorldTemplateLayoutNodeDraggable,
  isDialogProjectSettingsWorldTemplateLayoutNodeDroppable,
  isDialogProjectSettingsWorldTemplateLayoutRootDroppable
} from '../dialogProjectSettingsWorldTemplateLayoutDnD'

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Empty group names block save validation.
 */
test('Test that hasDialogProjectSettingsWorldTemplateGroupNameValidationError detects blank names', () => {
  const layout = appendDialogProjectSettingsWorldTemplateGroupDraft(createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(), 'en-US', 'Creatures')
  expect(hasDialogProjectSettingsWorldTemplateGroupNameValidationError(layout)).toBe(false)
  layout.groups[0].displayNameTranslations = { 'en-US': '   ' }
  expect(hasDialogProjectSettingsWorldTemplateGroupNameValidationError(layout)).toBe(true)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Maps layout draft to he-tree nodes and back while preserving metadata.
 */
test('Test that he-tree mapping round-trips layout draft placements', () => {
  const layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    appendDialogProjectSettingsWorldTemplateGroupDraft(createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(), 'en-US', 'Creatures'),
    {
      templateDisplayName: 'Character',
      documentTemplateId: 'template-a',
      icon: 'mdi-account',
      worldAppendix: 'Hero'
    }
  )
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  expect(nodes).toHaveLength(2)
  expect(nodes[0]?.nodeKind).toBe('group')
  expect(nodes[0]?.icon).toBe(DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON)
  expect(nodes[1]?.nodeKind).toBe('template')
  const roundTrip = mapHeTreeNodesToWorldTemplateLayoutDraft(nodes, layout)
  expect(mapDialogProjectSettingsWorldTemplateLayoutToSnapshot(roundTrip)).toEqual(
    mapDialogProjectSettingsWorldTemplateLayoutToSnapshot(layout)
  )
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDnD
 * Enforces two-level drag rules for groups and templates.
 */
test('Test that layout DnD rules reject nesting groups and template-on-template drops', () => {
  const groupNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: null,
    icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
    id: 'group-a',
    label: 'Creatures',
    displayNameTranslations: { 'en-US': 'Creatures' },
    nodeKind: 'group' as const,
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    templateDisplayName: '',
    usesNickname: false,
    worldAppendix: ''
  }
  const templateNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    id: 'placement-a',
    label: 'Character',
    displayNameTranslations: {},
    nodeKind: 'template' as const,
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    templateDisplayName: '',
    usesNickname: false,
    worldAppendix: ''
  }
  expect(isDialogProjectSettingsWorldTemplateLayoutNodeDraggable(groupNode)).toBe(true)
  expect(isDialogProjectSettingsWorldTemplateLayoutNodeDraggable({
    ...groupNode,
    nodeKind: 'other' as 'group'
  })).toBe(false)
  expect(isDialogProjectSettingsWorldTemplateLayoutRootDroppable({
    dragNode: { data: templateNode }
  })).toBe(true)
  expect(isDialogProjectSettingsWorldTemplateLayoutNodeDroppable(groupNode, {
    dragNode: { data: templateNode }
  })).toBe(true)
  expect(isDialogProjectSettingsWorldTemplateLayoutNodeDroppable(templateNode, {
    dragNode: { data: templateNode }
  })).toBe(false)
  expect(isDialogProjectSettingsWorldTemplateLayoutNodeDroppable(groupNode, {
    dragNode: { data: groupNode }
  })).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Maps API payloads and supports group/placement mutations.
 */
test('Test that layout draft helpers map API data and mutate groups or placements', () => {
  const fromApi = mapDialogProjectSettingsWorldTemplateLayoutFromApi({
    groups: [
      {
        createdAtMs: 1,
        displayName: 'Creatures',
        displayNameTranslations: { 'en-US': 'Creatures' },
        id: 'group-a',
        rootSortOrder: 0,
        updatedAtMs: 1,
        worldId: 'world-a'
      }
    ],
    placements: [
      {
        createdAtMs: 1,
        displayName: 'Character',
        nickname: '',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 2,
        documentTemplateId: 'template-a',
        groupId: 'group-a',
        groupSortOrder: 0,
        icon: 'mdi-account',
        id: 'placement-a',
        rootSortOrder: null,
        updatedAtMs: 1,
        worldAppendix: 'Hero',
        worldId: 'world-a'
      }
    ]
  } satisfies I_faProjectWorldTemplateLayoutForProjectSettings)
  expect(fromApi.placements[0]?.documentCountInWorld).toBe(2)

  let layout = appendDialogProjectSettingsWorldTemplateGroupDraft(createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(), 'en-US', 'Creatures')
  layout = renameDialogProjectSettingsWorldTemplateGroupDisplayNameTranslationsDraft(
    layout,
    layout.groups[0].id,
    { 'en-US': 'Renamed' }
  )
  expect(layout.groups[0]?.displayNameTranslations['en-US']).toBe('Renamed')

  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    templateDisplayName: 'Character',
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    worldAppendix: 'Hero'
  })
  const placementId = layout.placements[0]?.id ?? ''
  layout = removeDialogProjectSettingsWorldTemplatePlacementDraft(layout, placementId)
  expect(layout.placements).toHaveLength(0)

  layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Folder')
  const groupId = layout.groups[0]?.id ?? ''
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    templateDisplayName: 'Character',
    documentTemplateId: 'template-b',
    icon: 'mdi-account',
    worldAppendix: ''
  })
  layout = {
    ...layout,
    placements: [
      {
        ...layout.placements[0],
        groupId,
        groupSortOrder: 0,
        rootSortOrder: null
      }
    ]
  }
  layout = removeDialogProjectSettingsWorldTemplateGroupDraft(layout, groupId)
  expect(layout.groups).toHaveLength(0)
  expect(layout.placements[0]?.groupId).toBeNull()
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Ignores remove group requests when the group id is not present.
 */
test('Test that remove group draft returns the same layout for unknown group ids', () => {
  const layout = appendDialogProjectSettingsWorldTemplateGroupDraft(createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(), 'en-US', 'Creatures')
  const nextLayout = removeDialogProjectSettingsWorldTemplateGroupDraft(layout, 'missing-group-id')
  expect(nextLayout).toBe(layout)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Keeps lower root-order groups unchanged when deleting a higher-order group.
 */
test('Test that remove group draft leaves lower root-order groups unchanged', () => {
  let layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'First')
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Second')
  const secondGroupId = layout.groups[1]?.id ?? ''
  layout = removeDialogProjectSettingsWorldTemplateGroupDraft(layout, secondGroupId)
  expect(layout.groups).toHaveLength(1)
  expect(layout.groups[0]?.rootSortOrder).toBe(0)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Shifts root placements below a deleted group when nested templates are promoted.
 */
test('Test that remove group draft shifts trailing root placements after promotion', () => {
  let layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Creatures')
  const groupId = layout.groups[0]?.id ?? ''
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    templateDisplayName: 'Character',
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    worldAppendix: ''
  })
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    templateDisplayName: 'Location',
    documentTemplateId: 'template-b',
    icon: 'mdi-map',
    worldAppendix: ''
  })
  layout = {
    ...layout,
    placements: layout.placements.map((placement, index) => {
      if (index === 0) {
        return {
          ...placement,
          groupId,
          groupSortOrder: 0,
          rootSortOrder: null
        }
      }
      if (index === 1) {
        return {
          ...placement,
          groupId,
          groupSortOrder: 1,
          rootSortOrder: null
        }
      }
      return placement
    })
  }
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    templateDisplayName: 'Item',
    documentTemplateId: 'template-c',
    icon: 'mdi-cube',
    worldAppendix: ''
  })
  const trailingRoot = layout.placements.find((placement) => {
    return placement.documentTemplateId === 'template-c'
  })
  expect(trailingRoot?.rootSortOrder).toBe(1)
  layout = removeDialogProjectSettingsWorldTemplateGroupDraft(layout, groupId)
  const promotedRoot = layout.placements.find((placement) => {
    return placement.documentTemplateId === 'template-c'
  })
  expect(promotedRoot?.rootSortOrder).toBe(2)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeReverseMap
 * Falls back to the provided index when a node is absent from the top-level list.
 */
test('Test that he-tree node index resolution uses fallback when node is missing', () => {
  const node = {
    id: 'node-a'
  }
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeIndex([], node, 3)).toBe(3)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeIndex([node], node, 3)).toBe(0)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Uses he-tree node labels when prior placement metadata is missing.
 */
test('Test that he-tree reverse mapping falls back to node fields without prior rows', () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  const groupId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
  const nodes = [
    {
      children: [
        {
          children: [],
          documentCountInWorld: 4,
          documentTemplateId: 'template-a',
          icon: 'mdi-account',
          id: 'new-placement',
          label: 'Character',
          displayNameTranslations: {},
          nodeKind: 'template' as const,
          nicknamePluralTranslations: {},
          nicknameSingularTranslations: {},
          templateDisplayName: '',
          usesNickname: false,
          worldAppendix: 'Hero'
        }
      ],
      documentCountInWorld: 0,
      documentTemplateId: null,
      icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
      id: groupId,
      label: 'Creatures',
      displayNameTranslations: {},
      nodeKind: 'group' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    },
    {
      children: [],
      documentCountInWorld: 1,
      documentTemplateId: 'template-b',
      icon: 'mdi-map',
      id: 'root-placement',
      label: 'Location',
      displayNameTranslations: {},
      nodeKind: 'template' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: 'Map'
    }
  ]
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft(nodes, priorLayout)
  expect(mapped.placements).toHaveLength(2)
  expect(mapped.placements[0]?.groupId).toBe(groupId)
  expect(mapped.placements[1]?.rootSortOrder).toBe(1)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Nests grouped placements under their parent group node.
 */
test('Test that he-tree mapping nests grouped placements under group nodes', () => {
  const layout = {
    groups: [
      {
        displayNameTranslations: { 'en-US': 'Creatures' },
        id: 'group-a',
        rootSortOrder: 0
      }
    ],
    placements: [
      {
        templateDisplayName: 'Character',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 3,
        documentTemplateId: 'template-a',
        groupId: 'group-a',
        groupSortOrder: 0,
        icon: 'mdi-account',
        id: 'placement-a',
        rootSortOrder: null,
        worldAppendix: 'Hero'
      }
    ]
  }
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  expect(nodes).toHaveLength(1)
  expect(nodes[0]?.children).toHaveLength(1)
  expect(nodes[0]?.children[0]?.documentCountInWorld).toBe(3)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Sorts grouped placements with mixed null and numeric group sort orders.
 */
test('Test that he-tree mapping sorts grouped placements by group sort order', () => {
  const layout = {
    groups: [
      {
        displayNameTranslations: { 'en-US': 'Creatures' },
        id: 'group-a',
        rootSortOrder: 0
      }
    ],
    placements: [
      {
        templateDisplayName: 'Second',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-b',
        groupId: 'group-a',
        groupSortOrder: 1,
        icon: 'mdi-account',
        id: 'placement-b',
        rootSortOrder: null,
        worldAppendix: ''
      },
      {
        templateDisplayName: 'First',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-a',
        groupId: 'group-a',
        groupSortOrder: null,
        icon: 'mdi-account',
        id: 'placement-a',
        rootSortOrder: null,
        worldAppendix: ''
      }
    ]
  }
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  expect(nodes[0]?.children.map((child) => child.label)).toEqual(['First', 'Second'])
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Normalizes interleaved root groups and placements with null sort keys.
 */
test('Test that layout draft normalize reorders interleaved root rows with null sort keys', () => {
  const layout = {
    groups: [
      {
        displayNameTranslations: { 'en-US': 'Creatures' },
        id: 'group-a',
        rootSortOrder: 2
      }
    ],
    placements: [
      {
        templateDisplayName: 'Location',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-a',
        groupId: null,
        groupSortOrder: null,
        icon: 'mdi-map',
        id: 'placement-root',
        rootSortOrder: null,
        worldAppendix: ''
      },
      {
        templateDisplayName: 'Character',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-b',
        groupId: 'group-a',
        groupSortOrder: null,
        icon: 'mdi-account',
        id: 'placement-grouped',
        rootSortOrder: null,
        worldAppendix: ''
      }
    ]
  }
  const normalized = removeDialogProjectSettingsWorldTemplatePlacementDraft(layout, 'missing-id')
  expect(normalized.placements.find((placement) => placement.id === 'placement-root')?.rootSortOrder).toBe(0)
  expect(normalized.groups[0]?.rootSortOrder).toBe(1)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Normalizes multiple root groups and grouped placements with null sort keys.
 */
test('Test that layout draft normalize sorts multiple root groups and grouped placements', () => {
  const layout = {
    groups: [
      {
        displayNameTranslations: { 'en-US': 'Second group' },
        id: 'group-b',
        rootSortOrder: 3
      },
      {
        displayNameTranslations: { 'en-US': 'First group' },
        id: 'group-a',
        rootSortOrder: 1
      }
    ],
    placements: [
      {
        templateDisplayName: 'Root template',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-root',
        groupId: null,
        groupSortOrder: null,
        icon: 'mdi-map',
        id: 'placement-root',
        rootSortOrder: 2,
        worldAppendix: ''
      },
      {
        templateDisplayName: 'Grouped B',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-b',
        groupId: 'group-a',
        groupSortOrder: null,
        icon: 'mdi-account',
        id: 'placement-b',
        rootSortOrder: null,
        worldAppendix: ''
      },
      {
        templateDisplayName: 'Grouped A',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-a',
        groupId: 'group-a',
        groupSortOrder: null,
        icon: 'mdi-account',
        id: 'placement-a',
        rootSortOrder: null,
        worldAppendix: ''
      }
    ]
  }
  const normalized = removeDialogProjectSettingsWorldTemplatePlacementDraft(layout, 'missing-id')
  expect(normalized.groups.find((group) => group.id === 'group-a')?.rootSortOrder).toBe(0)
  expect(normalized.groups.find((group) => group.id === 'group-b')?.rootSortOrder).toBe(2)
  expect(normalized.placements.find((placement) => placement.id === 'placement-root')?.rootSortOrder).toBe(1)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Preserves prior placement metadata when he-tree node labels change.
 */
test('Test that he-tree reverse mapping keeps prior metadata for grouped and root nodes', () => {
  const layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    appendDialogProjectSettingsWorldTemplateGroupDraft(createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(), 'en-US', 'Creatures'),
    {
      templateDisplayName: 'Location',
      documentTemplateId: 'template-root',
      icon: 'mdi-map',
      worldAppendix: 'Map'
    }
  )
  const groupedPlacement = {
    templateDisplayName: 'Character',
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    documentCountInWorld: 2,
    documentTemplateId: 'template-a',
    groupId: layout.groups[0]?.id ?? '',
    groupSortOrder: 0,
    icon: 'mdi-account',
    id: 'placement-grouped',
    rootSortOrder: null,
    worldAppendix: 'Hero'
  }
  const layoutWithGrouped = {
    ...layout,
    placements: [
      groupedPlacement,
      ...layout.placements
    ]
  }
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layoutWithGrouped, 'en-US')
  if (nodes[0]?.nodeKind === 'group') {
    nodes[0].children[0].label = 'Changed grouped label'
  }
  const rootTemplateNode = nodes.find((node) => node.nodeKind === 'template')
  if (rootTemplateNode !== undefined) {
    rootTemplateNode.label = 'Changed root label'
  }
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft(nodes, layoutWithGrouped)
  expect(mapped.placements.find((placement) => placement.id === 'placement-grouped')?.templateDisplayName)
    .toBe('Character')
  expect(mapped.placements.find((placement) => placement.documentTemplateId === 'template-root')?.templateDisplayName)
    .toBe('Location')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Keeps grouped placement sort order when the group id is missing from layout groups.
 */
test('Test that layout draft normalize preserves group sort order for orphan group ids', () => {
  const layout = {
    groups: [],
    placements: [
      {
        templateDisplayName: 'Orphan grouped',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-a',
        groupId: 'missing-group',
        groupSortOrder: 4,
        icon: 'mdi-account',
        id: 'placement-a',
        rootSortOrder: null,
        worldAppendix: ''
      }
    ]
  }
  const normalized = removeDialogProjectSettingsWorldTemplatePlacementDraft(layout, 'missing-id')
  expect(normalized.placements[0]?.groupSortOrder).toBe(4)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Falls back to empty template ids when prior rows and node metadata are missing.
 */
test('Test that he-tree reverse mapping uses empty template ids when metadata is missing', () => {
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft([
    {
      children: [
        {
          children: [],
          documentCountInWorld: 0,
          documentTemplateId: null,
          icon: 'mdi-account',
          id: 'child-a',
          label: 'Child',
          displayNameTranslations: {},
          nodeKind: 'template',
          nicknamePluralTranslations: {},
          nicknameSingularTranslations: {},
          templateDisplayName: '',
          usesNickname: false,
          worldAppendix: ''
        }
      ],
      documentCountInWorld: 0,
      documentTemplateId: null,
      icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
      id: 'group-a',
      label: 'Creatures',
      displayNameTranslations: { 'en-US': 'Creatures' },
      nodeKind: 'group',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    }
  ], createEmptyDialogProjectSettingsWorldTemplateLayoutDraft())
  expect(mapped.placements[0]?.documentTemplateId).toBe('')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Uses node template ids for new root placements when prior rows are absent.
 */
test('Test that he-tree reverse mapping reads root template ids from node data', () => {
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft([
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: 'template-from-node',
      icon: 'mdi-map',
      id: 'new-root',
      label: 'Location',
      displayNameTranslations: {},
      nodeKind: 'template',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: 'Map'
    }
  ], createEmptyDialogProjectSettingsWorldTemplateLayoutDraft())
  expect(mapped.placements[0]?.documentTemplateId).toBe('template-from-node')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Covers numeric root and grouped sort keys plus prior root template metadata.
 */
test('Test that he-tree mapping and normalize handle numeric sort keys end to end', () => {
  const layout = {
    groups: [
      {
        displayNameTranslations: { 'en-US': 'Creatures' },
        id: 'group-a',
        rootSortOrder: 0
      }
    ],
    placements: [
      {
        templateDisplayName: 'Second root',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-b',
        groupId: null,
        groupSortOrder: null,
        icon: 'mdi-map',
        id: 'placement-root-b',
        rootSortOrder: 10,
        worldAppendix: ''
      },
      {
        templateDisplayName: 'First root',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-a',
        groupId: null,
        groupSortOrder: null,
        icon: 'mdi-map',
        id: 'placement-root-a',
        rootSortOrder: 5,
        worldAppendix: ''
      },
      {
        templateDisplayName: 'Second grouped',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-d',
        groupId: 'group-a',
        groupSortOrder: 2,
        icon: 'mdi-account',
        id: 'placement-group-b',
        rootSortOrder: null,
        worldAppendix: ''
      },
      {
        templateDisplayName: 'First grouped',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-c',
        groupId: 'group-a',
        groupSortOrder: 0,
        icon: 'mdi-account',
        id: 'placement-group-a',
        rootSortOrder: null,
        worldAppendix: ''
      }
    ]
  }
  const normalized = removeDialogProjectSettingsWorldTemplatePlacementDraft(layout, 'missing-id')
  const rootPlacements = normalized.placements
    .filter((placement) => placement.groupId === null)
    .sort((left, right) => (left.rootSortOrder ?? 0) - (right.rootSortOrder ?? 0))
  expect(rootPlacements.map((placement) => placement.id)).toEqual([
    'placement-root-a',
    'placement-root-b'
  ])
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(normalized, 'en-US')
  const rootNode = nodes.find((node) => node.id === 'placement-root-a')
  expect(rootNode?.label).toBe('First root')
  if (nodes[0]?.nodeKind === 'group') {
    expect(nodes[0].children.map((child) => child.label)).toEqual(['First grouped', 'Second grouped'])
  }
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft(nodes, normalized)
  expect(mapped.placements.find((placement) => placement.id === 'placement-root-a')?.documentTemplateId)
    .toBe('template-a')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Treats null root sort order as zero when building root placement rows.
 */
test('Test that he-tree mapping accepts null root sort order on unnormalized drafts', () => {
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft({
    groups: [],
    placements: [
      {
        templateDisplayName: 'Root template',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-a',
        groupId: null,
        groupSortOrder: null,
        icon: 'mdi-map',
        id: 'placement-root',
        rootSortOrder: null,
        worldAppendix: ''
      }
    ]
  }, 'en-US')
  expect(nodes).toHaveLength(1)
  expect(nodes[0]?.nodeKind).toBe('template')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Supports interleaved root rows and no-op rename for unknown group ids.
 */
test('Test that layout draft append and rename handle interleaved root rows', () => {
  let layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
    {
      templateDisplayName: 'Location',
      documentTemplateId: 'template-a',
      icon: 'mdi-map',
      worldAppendix: ''
    }
  )
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Creatures')
  const creaturesGroupId = layout.groups[0]?.id ?? ''
  expect(layout.groups).toHaveLength(1)
  expect(layout.placements[0]?.rootSortOrder).toBe(0)

  layout = renameDialogProjectSettingsWorldTemplateGroupDisplayNameTranslationsDraft(layout, 'missing-group', { 'en-US': 'Ignored' })
  expect(layout.groups[0]?.displayNameTranslations['en-US']).toBe('Creatures')

  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    templateDisplayName: 'Character',
    documentTemplateId: 'template-b',
    icon: 'mdi-account',
    worldAppendix: ''
  })
  expect(layout.placements).toHaveLength(2)

  layout = {
    ...layout,
    groups: [
      ...layout.groups,
      {
        displayNameTranslations: { 'en-US': 'Other' },
        id: 'group-b',
        rootSortOrder: 2
      }
    ],
    placements: [
      ...layout.placements,
      {
        templateDisplayName: 'Item',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-c',
        groupId: 'group-b',
        groupSortOrder: 0,
        icon: 'mdi-cube',
        id: 'placement-c',
        rootSortOrder: null,
        worldAppendix: ''
      }
    ]
  }
  layout = removeDialogProjectSettingsWorldTemplateGroupDraft(layout, creaturesGroupId)
  expect(layout.groups).toHaveLength(1)
  expect(layout.groups[0]?.id).toBe('group-b')
  expect(layout.placements.some((placement) => placement.groupId === 'group-b')).toBe(true)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Ungroups child templates at the removed group's former root position.
 */
test('Test that remove group promotes nested templates to the group root slot', () => {
  let layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
    {
      templateDisplayName: 'Root before',
      documentTemplateId: 'template-a',
      icon: 'mdi-map',
      worldAppendix: ''
    }
  )
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Creatures')
  const creaturesGroupId = layout.groups[0]?.id ?? ''
  expect(layout.groups[0]?.rootSortOrder).toBe(1)

  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    templateDisplayName: 'Root after',
    documentTemplateId: 'template-b',
    icon: 'mdi-map',
    worldAppendix: ''
  })

  layout = {
    ...layout,
    placements: [
      ...layout.placements.filter((placement) => placement.documentTemplateId !== 'template-b'),
      {
        templateDisplayName: 'Nested first',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-c',
        groupId: creaturesGroupId,
        groupSortOrder: 0,
        icon: 'mdi-account',
        id: 'placement-nested-a',
        rootSortOrder: null,
        worldAppendix: ''
      },
      {
        templateDisplayName: 'Nested second',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-d',
        groupId: creaturesGroupId,
        groupSortOrder: 1,
        icon: 'mdi-account',
        id: 'placement-nested-b',
        rootSortOrder: null,
        worldAppendix: ''
      },
      layout.placements.find((placement) => placement.documentTemplateId === 'template-b')!
    ]
  }

  layout = removeDialogProjectSettingsWorldTemplateGroupDraft(layout, creaturesGroupId)
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  expect(nodes.map((node) => node.label)).toEqual([
    'Root before',
    'Nested first',
    'Nested second',
    'Root after'
  ])
  expect(layout.groups).toHaveLength(0)
  expect(layout.placements.every((placement) => placement.groupId === null)).toBe(true)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDnD
 * Allows drops when drag context is empty.
 */
test('Test that layout DnD rules allow drops when drag context is empty', () => {
  const groupNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: null,
    icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
    id: 'group-a',
    label: 'Creatures',
    displayNameTranslations: { 'en-US': 'Creatures' },
    nodeKind: 'group' as const,
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    templateDisplayName: '',
    usesNickname: false,
    worldAppendix: ''
  }
  const templateNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    id: 'placement-a',
    label: 'Character',
    displayNameTranslations: {},
    nodeKind: 'template' as const,
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    templateDisplayName: '',
    usesNickname: false,
    worldAppendix: ''
  }
  expect(isDialogProjectSettingsWorldTemplateLayoutRootDroppable({
    dragNode: null
  })).toBe(true)
  expect(isDialogProjectSettingsWorldTemplateLayoutNodeDroppable(groupNode, {
    dragNode: null
  })).toBe(true)
  expect(isDialogProjectSettingsWorldTemplateLayoutRootDroppable({
    dragNode: { data: groupNode }
  })).toBe(true)
  expect(isDialogProjectSettingsWorldTemplateLayoutNodeDroppable(groupNode, {
    dragNode: {
      data: {
        ...templateNode,
        nodeKind: 'unknown' as 'template'
      }
    }
  })).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Appending a group preserves existing placement rows without duplication.
 */
test('Test that append group keeps existing template placements stable', () => {
  let layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
    {
      templateDisplayName: 'Template A',
      documentTemplateId: 'template-a',
      icon: 'mdi-file',
      worldAppendix: ''
    }
  )
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    templateDisplayName: 'Template B',
    documentTemplateId: 'template-b',
    icon: 'mdi-file',
    worldAppendix: ''
  })
  const placementIdsBefore = layout.placements.map((placement) => placement.id)
  const withGroup = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'New group')
  expect(withGroup.placements).toHaveLength(2)
  expect(withGroup.placements.map((placement) => placement.id)).toEqual(placementIdsBefore)
  expect(withGroup.groups).toHaveLength(1)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Appending a group keeps nested template placements under their existing group.
 */
test('Test that append group keeps nested template placements grouped', () => {
  const groupId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
  let layout = appendDialogProjectSettingsWorldTemplateGroupDraft(createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(), 'en-US', 'Creatures')
  layout = {
    ...layout,
    groups: layout.groups.map((group) => ({
      ...group,
      id: groupId
    }))
  }
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    templateDisplayName: 'Character',
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    worldAppendix: ''
  })
  layout = {
    ...layout,
    placements: layout.placements.map((placement) => ({
      ...placement,
      groupId,
      groupSortOrder: 0,
      rootSortOrder: null
    }))
  }
  const withSecondGroup = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'New group')
  const nested = withSecondGroup.placements.find((placement) => {
    return placement.documentTemplateId === 'template-a'
  })
  expect(nested?.groupId).toBe(groupId)
  expect(nested?.rootSortOrder).toBeNull()
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Full reorder-then-nest-then-add-group flow keeps the nested placement grouped.
 */
test('Test that append group after reorder and nest keeps template under group', () => {
  const groupId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
  let layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
    {
      templateDisplayName: 'Location',
      documentTemplateId: 'template-b',
      icon: 'mdi-map',
      worldAppendix: ''
    }
  )
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Creatures')
  layout = {
    ...layout,
    groups: layout.groups.map((group) => ({
      ...group,
      id: groupId,
      rootSortOrder: 0
    })),
    placements: layout.placements.map((placement) => ({
      ...placement,
      rootSortOrder: 1
    }))
  }
  layout = {
    groups: layout.groups,
    placements: [
      ...layout.placements.filter((placement) => placement.documentTemplateId !== 'template-b'),
      {
        templateDisplayName: 'Location',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-b',
        groupId,
        groupSortOrder: 0,
        icon: 'mdi-map',
        id: layout.placements[0]?.id ?? 'placement-b',
        rootSortOrder: null,
        worldAppendix: ''
      }
    ]
  }
  const withSecondGroup = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'New group')
  const nested = withSecondGroup.placements.find((placement) => {
    return placement.documentTemplateId === 'template-b'
  })
  expect(withSecondGroup.groups).toHaveLength(2)
  expect(nested?.groupId).toBe(groupId)
  expect(nested?.rootSortOrder).toBeNull()
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Detects stale he-tree echoes that flatten grouped templates to root.
 */
test('Test that grouped-to-root regression detects stale flattened he-tree nodes', () => {
  const groupId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
  const priorLayout = {
    groups: [
      {
        displayNameTranslations: { 'en-US': 'Creatures' },
        id: groupId,
        rootSortOrder: 0
      }
    ],
    placements: [
      {
        templateDisplayName: 'Character',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-a',
        groupId,
        groupSortOrder: 0,
        icon: 'mdi-account',
        id: 'placement-a',
        rootSortOrder: null,
        worldAppendix: ''
      }
    ]
  }
  const staleNodes = [
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      icon: 'mdi-account',
      id: 'placement-a',
      label: 'Character',
      displayNameTranslations: {},
      nodeKind: 'template' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    },
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: null,
      icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
      id: groupId,
      label: 'Creatures',
      displayNameTranslations: {},
      nodeKind: 'group' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    }
  ]
  const flattened = mapHeTreeNodesToWorldTemplateLayoutDraft(staleNodes, priorLayout)
  expect(
    hasDialogProjectSettingsWorldTemplateLayoutGroupedToRootRegression(priorLayout, flattened)
  ).toBe(true)
  const properNodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(priorLayout, 'en-US')
  const roundTrip = mapHeTreeNodesToWorldTemplateLayoutDraft(properNodes, priorLayout)
  expect(
    hasDialogProjectSettingsWorldTemplateLayoutGroupedToRootRegression(priorLayout, roundTrip)
  ).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Prefers nested template rows when he-tree echoes a root ghost before the group node.
 */
test('Test that he-tree reverse mapping keeps nested template when root ghost precedes group', () => {
  const groupId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
  const secondGroupId = 'bbbbbbbb-bbbb-4ccc-8ddd-ffffffffffff'
  const priorLayout = {
    groups: [
      {
        displayNameTranslations: { 'en-US': 'Creatures' },
        id: groupId,
        rootSortOrder: 0
      },
      {
        displayNameTranslations: { 'en-US': 'New group' },
        id: secondGroupId,
        rootSortOrder: 2
      }
    ],
    placements: [
      {
        templateDisplayName: 'Character',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-a',
        groupId,
        groupSortOrder: 0,
        icon: 'mdi-account',
        id: 'placement-a',
        rootSortOrder: null,
        worldAppendix: ''
      },
      {
        templateDisplayName: 'Location',

        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        documentCountInWorld: 0,
        documentTemplateId: 'template-b',
        groupId: null,
        groupSortOrder: null,
        icon: 'mdi-map',
        id: 'placement-b',
        rootSortOrder: 1,
        worldAppendix: ''
      }
    ]
  }
  const nestedTemplateNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    id: 'placement-a',
    label: 'Character',
    displayNameTranslations: {},
    nodeKind: 'template' as const,
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    templateDisplayName: '',
    usesNickname: false,
    worldAppendix: ''
  }
  const staleNodes = [
    {
      ...nestedTemplateNode,
      id: 'stale-root-ghost'
    },
    {
      children: [nestedTemplateNode],
      documentCountInWorld: 0,
      documentTemplateId: null,
      icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
      id: groupId,
      label: 'Creatures',
      displayNameTranslations: {},
      nodeKind: 'group' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    },
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: 'template-b',
      icon: 'mdi-map',
      id: 'placement-b',
      label: 'Location',
      displayNameTranslations: {},
      nodeKind: 'template' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    },
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: null,
      icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
      id: secondGroupId,
      label: 'New group',
      displayNameTranslations: {},
      nodeKind: 'group' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    }
  ]
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft(staleNodes, priorLayout)
  const nested = mapped.placements.find((placement) => {
    return placement.documentTemplateId === 'template-a'
  })
  expect(nested?.groupId).toBe(groupId)
  expect(nested?.rootSortOrder).toBeNull()
  expect(
    hasDialogProjectSettingsWorldTemplateLayoutGroupedToRootRegression(priorLayout, mapped)
  ).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Ignores duplicate he-tree template nodes that reuse the same document template id.
 */
test('Test that he-tree reverse mapping dedupes cloned template nodes', () => {
  const layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    appendDialogProjectSettingsWorldTemplateGroupDraft(createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(), 'en-US', 'Creatures'),
    {
      templateDisplayName: 'Character',
      documentTemplateId: 'template-a',
      icon: 'mdi-account',
      worldAppendix: ''
    }
  )
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  const templateNode = nodes.find((node) => node.nodeKind === 'template')
  expect(templateNode).toBeDefined()
  const corruptedNodes = [
    ...nodes,
    {
      ...templateNode!,
      id: 'cloned-placement-id'
    }
  ]
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft(corruptedNodes, layout)
  expect(mapped.placements).toHaveLength(1)
  expect(mapped.placements[0]?.documentTemplateId).toBe('template-a')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeReverseMap
 * Skips duplicate root template nodes that share the same document template id.
 */
test('Test that he-tree reverse mapping skips duplicate root template document ids', () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  const nodes = [
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      icon: 'mdi-account',
      id: '880e8400-e29b-41d4-a716-446655440001',
      label: 'Character',
      displayNameTranslations: {},
      nodeKind: 'template' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    },
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      icon: 'mdi-account',
      id: '990e8400-e29b-41d4-a716-446655440002',
      label: 'Character clone',
      displayNameTranslations: {},
      nodeKind: 'template' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    }
  ]
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft(nodes, priorLayout)
  expect(mapped.placements).toHaveLength(1)
  expect(mapped.placements[0]?.id).toBe('880e8400-e29b-41d4-a716-446655440001')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeReverseMap
 * Skips duplicate nested template nodes under one group.
 */
test('Test that he-tree reverse mapping skips duplicate group child document ids', () => {
  const groupId = '770e8400-e29b-41d4-a716-446655440001'
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  priorLayout.groups = [
    {
      displayNameTranslations: { 'en-US': 'Creatures' },
      id: groupId,
      rootSortOrder: 0
    }
  ]
  const nodes = [
    {
      children: [
        {
          children: [],
          documentCountInWorld: 0,
          documentTemplateId: 'template-a',
          icon: 'mdi-account',
          id: '880e8400-e29b-41d4-a716-446655440001',
          label: 'Character',
          displayNameTranslations: {},
          nodeKind: 'template' as const,
          nicknamePluralTranslations: {},
          nicknameSingularTranslations: {},
          templateDisplayName: '',
          usesNickname: false,
          worldAppendix: ''
        },
        {
          children: [],
          documentCountInWorld: 0,
          documentTemplateId: 'template-a',
          icon: 'mdi-account',
          id: '990e8400-e29b-41d4-a716-446655440002',
          label: 'Character clone',
          displayNameTranslations: {},
          nodeKind: 'template' as const,
          nicknamePluralTranslations: {},
          nicknameSingularTranslations: {},
          templateDisplayName: '',
          usesNickname: false,
          worldAppendix: ''
        }
      ],
      documentCountInWorld: 0,
      documentTemplateId: '',
      icon: 'mdi-folder',
      id: groupId,
      label: 'Creatures',
      displayNameTranslations: {},
      nodeKind: 'group' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    }
  ]
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft(nodes, priorLayout)
  expect(mapped.placements).toHaveLength(1)
  expect(mapped.placements[0]?.documentTemplateId).toBe('template-a')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDraft
 * Snapshot mapping ignores display metadata outside the IPC payload.
 */
test('Test that layout draft snapshot mapping ignores display-only placement fields', () => {
  const left = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
    {
      templateDisplayName: 'Left label',
      documentTemplateId: 'template-a',
      icon: 'mdi-file',
      worldAppendix: 'A'
    }
  )
  const right = {
    ...left,
    placements: left.placements.map((placement) => ({
      ...placement,
      displayName: 'Right label',
      worldAppendix: 'B'
    }))
  }
  expect(mapDialogProjectSettingsWorldTemplateLayoutToSnapshot(left)).toEqual(
    mapDialogProjectSettingsWorldTemplateLayoutToSnapshot(right)
  )
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Accepts only persisted UUID ids for new groups mapped from he-tree nodes.
 */
test('Test that he-tree group id resolution accepts UUIDs and rejects ad hoc ids', () => {
  expect(isDialogProjectSettingsWorldTemplateLayoutPersistedId(
    'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
  )).toBe(true)
  expect(isDialogProjectSettingsWorldTemplateLayoutPersistedId('group-1')).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Dedupes cloned group nodes that reuse the same persisted group id.
 */
test('Test that he-tree reverse mapping dedupes cloned group nodes by id', () => {
  const layout = appendDialogProjectSettingsWorldTemplateGroupDraft(createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(), 'en-US', 'Creatures')
  const groupId = layout.groups[0]?.id ?? ''
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  const groupNode = nodes.find((node) => node.nodeKind === 'group')
  expect(groupNode).toBeDefined()
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft([
    ...nodes,
    {
      ...groupNode!,
      label: 'Creatures copy'
    }
  ], layout)
  expect(mapped.groups).toHaveLength(1)
  expect(mapped.groups[0]?.id).toBe(groupId)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Assigns a persisted UUID when he-tree returns a non-UUID group node id.
 */
test('Test that he-tree reverse mapping assigns UUIDs to invalid group node ids', () => {
  const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft([
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: null,
      icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
      id: 'he-tree-temp-group-id',
      label: 'Creatures',
      displayNameTranslations: { 'en-US': 'Creatures' },
      nodeKind: 'group',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    }
  ], createEmptyDialogProjectSettingsWorldTemplateLayoutDraft())
  expect(mapped.groups).toHaveLength(1)
  expect(isDialogProjectSettingsWorldTemplateLayoutPersistedId(mapped.groups[0]?.id ?? '')).toBe(true)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeNodeWalk
 * Finds template placement under root, group, or missing.
 */
test('Test that tree node walk resolves grouped and root template placements', () => {
  const layout = appendDialogProjectSettingsWorldTemplateGroupDraft(createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(), 'en-US', 'Creatures')
  const groupId = layout.groups[0]?.id ?? ''
  layout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId,
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: null,
      worldAppendix: ''
    }
  ]
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  expect(findDialogProjectSettingsWorldTemplateLayoutTreeTemplatePlacement(nodes, 'template-a')).toBe('group')
  expect(findDialogProjectSettingsWorldTemplateLayoutTreeTemplatePlacement(nodes, 'missing')).toBe('missing')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutOrphanPlacements
 * Re-appends orphan grouped placements missing from drag commit output.
 */
test('Test that orphan merge preserves placements whose group id is missing from mapped layout', () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  priorLayout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: 'missing-group',
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: null,
      worldAppendix: ''
    }
  ]
  const mapped = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  const merged = mergeOrphanPlacementsFromPriorWorldTemplateLayout(mapped, priorLayout)
  expect(merged.placements).toHaveLength(1)
  expect(merged.placements[0]?.groupId).toBe('missing-group')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutOrphanPlacements
 * Skips re-appending placements already present or tied to surviving groups.
 */
test('Test that orphan merge skips placements already mapped or rooted in surviving groups', () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  priorLayout.groups = [
    {
      displayNameTranslations: { 'en-US': 'Creatures' },
      id: 'group-a',
      rootSortOrder: 0
    }
  ]
  priorLayout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: 'group-a',
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: null,
      worldAppendix: ''
    },
    {
      templateDisplayName: 'Root row',

      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-b',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-map',
      id: 'placement-b',
      rootSortOrder: 1,
      worldAppendix: ''
    }
  ]
  const mapped = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  mapped.groups = priorLayout.groups
  mapped.placements = [priorLayout.placements[0]!]
  const merged = mergeOrphanPlacementsFromPriorWorldTemplateLayout(mapped, priorLayout)
  expect(merged.placements).toHaveLength(1)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutOrphanPlacements
 * Skips orphan merge when mapped layout still contains the orphan group id.
 */
test('Test that orphan merge skips placements whose group id still exists in mapped layout', () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  priorLayout.groups = [
    {
      displayNameTranslations: { 'en-US': 'Creatures' },
      id: 'group-a',
      rootSortOrder: 0
    }
  ]
  priorLayout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: 'group-a',
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: null,
      worldAppendix: ''
    }
  ]
  const mapped = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  mapped.groups = priorLayout.groups
  const merged = mergeOrphanPlacementsFromPriorWorldTemplateLayout(mapped, priorLayout)
  expect(merged.placements).toHaveLength(0)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutOrphanPlacements
 * Skips orphan merge when mapped layout already contains the document template id.
 */
test('Test that orphan merge skips placements when document template id is already mapped', () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  priorLayout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: 'missing-group',
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: null,
      worldAppendix: ''
    }
  ]
  const mapped = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  mapped.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-root',
      rootSortOrder: 0,
      worldAppendix: ''
    }
  ]
  const merged = mergeOrphanPlacementsFromPriorWorldTemplateLayout(mapped, priorLayout)
  expect(merged.placements).toHaveLength(1)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeEmitGuard
 * Ignores prior grouped placements missing from the next mapped layout draft.
 */
test('Test that shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit ignores removed placements', () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  priorLayout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: 'group-a',
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: null,
      worldAppendix: ''
    }
  ]
  expect(shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit(
    priorLayout,
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
    []
  )).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeRegression
 * Blocks emit when draft un-nests but tree still shows grouped placement.
 */
test('Test that shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit detects stale grouped tree nodes', () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  priorLayout.groups = [
    {
      displayNameTranslations: { 'en-US': 'Creatures' },
      id: '770e8400-e29b-41d4-a716-446655440001',
      rootSortOrder: 0
    }
  ]
  priorLayout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: '770e8400-e29b-41d4-a716-446655440001',
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: '880e8400-e29b-41d4-a716-446655440001',
      rootSortOrder: null,
      worldAppendix: ''
    }
  ]
  const nextLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  nextLayout.groups = priorLayout.groups
  nextLayout.placements = [
    {
      ...priorLayout.placements[0]!,
      groupId: null,
      groupSortOrder: null,
      rootSortOrder: 1
    }
  ]
  const treeNodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(priorLayout, 'en-US')
  expect(shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit(
    priorLayout,
    nextLayout,
    treeNodes
  )).toBe(true)
  const rootOnlyNodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(nextLayout, 'en-US')
  expect(shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit(
    priorLayout,
    nextLayout,
    rootOnlyNodes
  )).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeRegression
 * Ignores prior placements removed from the next layout when checking regression.
 */
test('Test that grouped-to-root regression ignores removed placements', () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  priorLayout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: 'group-a',
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: null,
      worldAppendix: ''
    }
  ]
  expect(hasDialogProjectSettingsWorldTemplateLayoutGroupedToRootRegression(
    priorLayout,
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  )).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeEmitGuard
 * Allows emit when grouped placement stays grouped in the next layout draft.
 */
test('Test that shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit allows still-grouped placements', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.groups = [
    {
      displayNameTranslations: { 'en-US': 'Creatures' },
      id: '770e8400-e29b-41d4-a716-446655440001',
      rootSortOrder: 0
    }
  ]
  layout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: '770e8400-e29b-41d4-a716-446655440001',
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: '880e8400-e29b-41d4-a716-446655440001',
      rootSortOrder: null,
      worldAppendix: ''
    }
  ]
  const treeNodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  expect(shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit(
    layout,
    layout,
    treeNodes
  )).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Tree structure key ignores display labels so rename does not remount he-tree.
 */
test('Test that tree structure key is stable when only group display names change', () => {
  let layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Creatures')
  const groupId = layout.groups[0]!.id
  const beforeKey = mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey(layout)
  layout = renameDialogProjectSettingsWorldTemplateGroupDisplayNameTranslationsDraft(layout, groupId, { 'en-US': 'Renamed creatures' })
  expect(mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey(layout)).toBe(beforeKey)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Tree structure key ignores sort order so drag reorder does not remount he-tree.
 */
test('Test that tree structure key is stable when only root sort orders change', () => {
  let layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    templateDisplayName: 'Character',
    worldAppendix: ''
  })
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    documentTemplateId: 'template-b',
    icon: 'mdi-map',
    templateDisplayName: 'Location',
    worldAppendix: ''
  })
  const beforeKey = mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey(layout)
  layout.placements[0]!.rootSortOrder = 1
  layout.placements[1]!.rootSortOrder = 0
  expect(mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey(layout)).toBe(beforeKey)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Tree structure key ignores draft array order when topology is unchanged.
 */
test('Test that tree structure key is stable when draft array order differs', () => {
  let layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Creatures')
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Locations')
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    templateDisplayName: 'Character',
    worldAppendix: ''
  })
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    documentTemplateId: 'template-b',
    icon: 'mdi-map',
    templateDisplayName: 'Place',
    worldAppendix: ''
  })
  const beforeKey = mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey(layout)
  const reversedLayout = {
    groups: [...layout.groups].reverse(),
    placements: [...layout.placements].reverse()
  }
  const treeMappedLayout = mapHeTreeNodesToWorldTemplateLayoutDraft(
    buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US'),
    layout
  )
  expect(mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey(reversedLayout)).toBe(beforeKey)
  expect(mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey(treeMappedLayout)).toBe(beforeKey)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Scroll helper resolves the he-tree root inside the layout tree host wrapper.
 */
test('Test that tree scroll container resolver finds he-tree root inside host', () => {
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'dialogProjectSettingsWorldTemplateLayoutTree'
  host.append(tree)
  document.body.append(host)

  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeScrollContainer(host)).toBe(tree)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeScrollContainer(tree)).toBe(tree)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeScrollContainer(null)).toBeNull()
})

test('Test that tree scroll container resolver falls back to host when tree root is missing', () => {
  const host = document.createElement('div')
  document.body.append(host)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeScrollContainer(host)).toBe(host)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeData
 * Label patch updates he-tree nodes without replacing the tree array.
 */
test('Test that label patch updates group names in existing he-tree nodes', () => {
  let layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Creatures')
  const groupId = layout.groups[0]!.id
  const treeNodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  layout = renameDialogProjectSettingsWorldTemplateGroupDisplayNameTranslationsDraft(layout, groupId, { 'en-US': 'Renamed creatures' })
  patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes(treeNodes, layout, 'en-US')
  expect(treeNodes[0]?.label).toBe('Renamed creatures')
})

/**
 * patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes
 * Skips tree nodes that no longer exist in the layout draft.
 */
test('Test that label patch ignores stale he-tree nodes missing from layout draft', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  const staleGroupNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
    children: [
      {
        children: [],
        documentCountInWorld: 0,
        documentTemplateId: 'template-a',
        icon: 'mdi-account',
        id: 'missing-placement',
        label: 'Stale child',
        displayNameTranslations: {},
        nodeKind: 'template',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        templateDisplayName: '',
        usesNickname: false,
        worldAppendix: ''
      }
    ],
    documentCountInWorld: 0,
    documentTemplateId: null,
    icon: 'mdi-folder',
    id: 'missing-group',
    label: 'Stale group',
    displayNameTranslations: {},
    nodeKind: 'group',
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    templateDisplayName: '',
    usesNickname: false,
    worldAppendix: ''
  }
  const staleRootTemplate: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: 'template-b',
    icon: 'mdi-map',
    id: 'missing-root-placement',
    label: 'Stale root template',
    displayNameTranslations: {},
    nodeKind: 'template',
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    templateDisplayName: '',
    usesNickname: false,
    worldAppendix: ''
  }
  patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes(
    [staleGroupNode, staleRootTemplate],
    layout,
    'en-US'
  )
  expect(staleGroupNode.label).toBe('Stale group')
  expect(staleRootTemplate.label).toBe('Stale root template')
})

/**
 * patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes
 * Updates grouped template rows when structure is unchanged.
 */
test('Test that label patch updates grouped template rows in existing he-tree nodes', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.groups = [
    {
      displayNameTranslations: { 'en-US': 'Creatures' },
      id: '770e8400-e29b-41d4-a716-446655440001',
      rootSortOrder: 0
    }
  ]
  layout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      documentCountInWorld: 2,
      documentTemplateId: 'template-a',
      groupId: '770e8400-e29b-41d4-a716-446655440001',
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: '880e8400-e29b-41d4-a716-446655440001',
      rootSortOrder: null,
      worldAppendix: 'of Eldoria'
    }
  ]
  const treeNodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  layout.placements[0]!.templateDisplayName = 'Hero'
  layout.placements[0]!.worldAppendix = ' of Myth'
  patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes(treeNodes, layout, 'en-US')
  expect(treeNodes[0]?.children[0]?.label).toBe('Hero')
  expect(treeNodes[0]?.children[0]?.worldAppendix).toBe(' of Myth')
})

test('Test that placement label helpers resolve nickname and canonical fallback', () => {
  expect(resolveDialogProjectSettingsWorldTemplatePlacementUsesNickname({
    languageCode: 'en-US',
    nicknamePluralTranslations: { 'en-US': '  Hero  ' },
    nicknameSingularTranslations: {},
  })).toBe(true)
  expect(resolveDialogProjectSettingsWorldTemplatePlacementUsesNickname({
    languageCode: 'en-US',
    nicknamePluralTranslations: { 'en-US': '   ' },
    nicknameSingularTranslations: {},
  })).toBe(false)
  expect(resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabel({
    languageCode: 'en-US',
    nicknamePluralTranslations: { 'en-US': '  Hero  ' },
    nicknameSingularTranslations: {},
    templateDisplayName: 'Character'
  })).toBe('Hero')
  expect(resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabel({
    languageCode: 'en-US',
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    templateDisplayName: 'Character'
  })).toBe('Character')
})

test('Test that he-tree nodes use nickname label and accent flag when nickname is set', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      templateDisplayName: 'Character',
      nicknamePluralTranslations: { 'en-US': 'Hero' },
      nicknameSingularTranslations: {},
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    }
  ]
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  expect(nodes[0]?.label).toBe('Hero')
  expect(nodes[0]?.usesNickname).toBe(true)
  expect(nodes[0]?.templateDisplayName).toBe('Character')
})

test('Test that patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes skips unknown placement ids', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.groups = [
    {
      displayNameTranslations: { 'en-US': 'Creatures' },
      id: 'group-a',
      rootSortOrder: 0
    }
  ]
  const treeNodes: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[] = [
    {
      children: [
        {
          children: [],
          documentCountInWorld: 0,
          documentTemplateId: 'template-a',
          icon: 'mdi-account',
          id: 'missing-placement',
          label: 'Stale',
          displayNameTranslations: {},
          nodeKind: 'template',
          nicknamePluralTranslations: {},
          nicknameSingularTranslations: {},
          templateDisplayName: 'Stale',
          usesNickname: false,
          worldAppendix: ''
        }
      ],
      documentCountInWorld: 0,
      documentTemplateId: null,
      icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
      displayNameTranslations: { 'en-US': 'Creatures' },
      id: 'group-a',
      label: 'Creatures',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      nodeKind: 'group',
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    },
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: 'template-b',
      icon: 'mdi-map',
      id: 'missing-root-placement',
      label: 'Stale root',
      displayNameTranslations: {},
      nodeKind: 'template',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: 'Stale root',
      usesNickname: false,
      worldAppendix: ''
    }
  ]
  patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes(treeNodes, layout, 'en-US')
  expect(treeNodes[0]?.children[0]?.label).toBe('Stale')
  expect(treeNodes[1]?.label).toBe('Stale root')
})

test('Test that he-tree mapping reads legacy placement displayName when templateDisplayName is absent', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      displayName: 'Legacy name',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    } as unknown as I_dialogProjectSettingsWorldTemplatePlacementDraft
  ]
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  expect(nodes[0]?.label).toBe('Legacy name')
  expect(nodes[0]?.templateDisplayName).toBe('Legacy name')
})

test('Test that renameDialogProjectSettingsWorldTemplatePlacementNicknameTranslationsDraft updates one placement', () => {
  const layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
    {
      templateDisplayName: 'Character',
      documentTemplateId: 'template-a',
      icon: 'mdi-account',
      worldAppendix: ''
    }
  )
  const renamed = renameDialogProjectSettingsWorldTemplatePlacementNicknameTranslationsDraft(layout, layout.placements[0]!.id, {
    plural: { 'en-US': 'Hero' },
    singular: {}
  })
  expect(renamed.placements[0]?.nicknamePluralTranslations['en-US']).toBe('Hero')
  expect(layout.placements[0]?.nicknamePluralTranslations).toEqual({})
})

test('Test that he-tree mapping uses empty label when placement names are missing', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    } as unknown as I_dialogProjectSettingsWorldTemplatePlacementDraft
  ]
  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  expect(nodes[0]?.label).toBe('')
  expect(nodes[0]?.templateDisplayName).toBe('')
})
