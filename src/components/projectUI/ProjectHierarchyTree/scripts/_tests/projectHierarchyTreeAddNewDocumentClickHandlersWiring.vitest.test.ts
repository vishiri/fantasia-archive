/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeAddNewDocumentNode } from '../projectHierarchyTreeAddNewDocumentNode'
import { createProjectHierarchyTreeAddNewDocumentClickHandlers } from '../projectHierarchyTreeSyncMapperWiring'
import { createProjectHierarchyTreeTagAddDocumentClickHandler } from '../projectHierarchyTreeTagAddDocumentWiring'

function createAddNewNode (): I_faProjectHierarchyTreeHeTreeNode {
  return createProjectHierarchyTreeAddNewDocumentNode({
    label: 'Add new character',
    placement: {
      documentTemplateId: 'template-1',
      icon: 'mdi-account',
      id: 'placement-1',
      placementId: 'placement-1',
      titlePluralTranslations: { 'en-US': 'Characters' },
      titleSingularTranslations: { 'en-US': 'Character' },
      worldColor: '#336699',
      worldId: 'world-1'
    }
  })
}

test('Test that add-new left click creates temporary document with leftNavigate', async () => {
  const createTemporaryDocument = vi.fn(async () => 'temp-doc-1')
  const handlers = createProjectHierarchyTreeAddNewDocumentClickHandlers({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US'
  })
  const event = {
    stopPropagation: vi.fn()
  } as unknown as MouseEvent
  handlers.onAddNewDocumentRowClick(createAddNewNode(), event)
  expect(createTemporaryDocument).toHaveBeenCalledWith({
    displayName: 'New character',
    openMode: 'leftNavigate',
    parentDocumentId: null,
    placementId: 'placement-1',
    templateId: 'template-1',
    worldId: 'world-1'
  })
  expect(event.stopPropagation).toHaveBeenCalled()
})

test('Test that a second add-new left click is ignored while the first create runs', async () => {
  await Promise.resolve()
  await Promise.resolve()
  let releaseCreate: (() => void) | undefined
  const createGate = new Promise<string>((resolve) => {
    releaseCreate = () => {
      resolve('temp-doc-1')
    }
  })
  const createTemporaryDocument = vi.fn(() => createGate)
  const handlers = createProjectHierarchyTreeAddNewDocumentClickHandlers({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US'
  })
  handlers.onAddNewDocumentRowClick(createAddNewNode())
  handlers.onAddNewDocumentRowClick(createAddNewNode())
  await Promise.resolve()
  expect(createTemporaryDocument).toHaveBeenCalledTimes(1)
  const finishCreate = releaseCreate
  if (finishCreate === undefined) {
    throw new Error('missing create resolver')
  }
  finishCreate()
  await createGate
})

test('Test that add-new middle click creates temporary document with middleBackground', async () => {
  const createTemporaryDocument = vi.fn(async () => 'temp-doc-2')
  const handlers = createProjectHierarchyTreeAddNewDocumentClickHandlers({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US'
  })
  const event = {
    button: 1,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as MouseEvent
  handlers.onAddNewDocumentRowAuxClick(createAddNewNode(), event)
  expect(createTemporaryDocument).toHaveBeenCalledWith({
    displayName: 'New character',
    openMode: 'middleBackground',
    parentDocumentId: null,
    placementId: 'placement-1',
    templateId: 'template-1',
    worldId: 'world-1'
  })
  expect(event.preventDefault).toHaveBeenCalled()
})

test('Test that template placement middle click creates temporary document with middleBackground', async () => {
  const createTemporaryDocument = vi.fn(async () => 'temp-doc-3')
  const handlers = createProjectHierarchyTreeAddNewDocumentClickHandlers({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US'
  })
  const event = {
    button: 1,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as MouseEvent
  handlers.onAddNewDocumentRowAuxClick({
    children: [],
    childrenLoaded: true,
    documentId: null,
    documentTemplateId: 'template-1',
    groupId: null,
    hasChildren: true,
    icon: 'mdi-office-building',
    id: 'placement-1',
    label: 'Buildings',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    titlePluralTranslations: { 'en-US': 'Buildings' },
    titleSingularTranslations: { 'en-US': 'Building' },
    worldColor: '#336699',
    worldId: 'world-1'
  }, event)
  expect(createTemporaryDocument).toHaveBeenCalledWith({
    displayName: 'New building',
    openMode: 'middleBackground',
    parentDocumentId: null,
    placementId: 'placement-1',
    templateId: 'template-1',
    worldId: 'world-1'
  })
  expect(event.preventDefault).toHaveBeenCalled()
})

test('Test that add-new click handlers ignore non-add-new rows', () => {
  const createTemporaryDocument = vi.fn(async () => 'temp-doc')
  const handlers = createProjectHierarchyTreeAddNewDocumentClickHandlers({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US'
  })
  handlers.onAddNewDocumentRowClick({
    children: [],
    childrenLoaded: true,
    documentId: 'doc-a',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-a',
    label: 'Doc',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  })
  expect(createTemporaryDocument).not.toHaveBeenCalled()
})

test('Test that add-new click handlers ignore rows with missing template id', () => {
  const createTemporaryDocument = vi.fn(async () => 'temp-doc')
  const handlers = createProjectHierarchyTreeAddNewDocumentClickHandlers({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US'
  })
  handlers.onAddNewDocumentRowClick({
    ...createAddNewNode(),
    documentTemplateId: null
  })
  expect(createTemporaryDocument).not.toHaveBeenCalled()
})

test('Test that add-new aux click ignores non-middle mouse buttons', () => {
  const createTemporaryDocument = vi.fn(async () => 'temp-doc')
  const handlers = createProjectHierarchyTreeAddNewDocumentClickHandlers({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US'
  })
  handlers.onAddNewDocumentRowAuxClick(createAddNewNode(), {
    button: 0,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as MouseEvent)
  expect(createTemporaryDocument).not.toHaveBeenCalled()
})

test('Test that a tag add is not blocked by an in-flight add-new on the same placement', async () => {
  await Promise.resolve()
  await Promise.resolve()
  let releaseCreate: (() => void) | undefined
  const createGate = new Promise<string>((resolve) => {
    releaseCreate = () => {
      resolve('temp-doc')
    }
  })
  const createTemporaryDocument = vi.fn(() => createGate)
  const handlers = createProjectHierarchyTreeAddNewDocumentClickHandlers({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US'
  })
  let tagId = 'tag-1'
  const placement: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    documentTemplateId: 'template-1',
    groupId: null,
    hasChildren: false,
    icon: 'mdi-account',
    id: 'placement-1',
    label: 'Characters',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    titlePluralTranslations: { 'en-US': 'Characters' },
    titleSingularTranslations: { 'en-US': 'Character' },
    worldColor: '#336699',
    worldId: 'world-1'
  }
  const onTagAdd = createProjectHierarchyTreeTagAddDocumentClickHandler({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US',
    resolveTagContextMenuAnchor: () => ({
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: 'mdi-tag',
      id: tagId,
      label: tagId,
      nodeKind: 'tag',
      placementId: null,
      tagId,
      worldColor: '#000',
      worldId: 'world-1'
    }),
    treeData: [placement]
  })
  handlers.onAddNewDocumentRowClick(createAddNewNode())
  onTagAdd('placement-1')
  onTagAdd('placement-1')
  tagId = 'tag-2'
  onTagAdd('placement-1')
  expect(createTemporaryDocument).toHaveBeenCalledTimes(3)
  const finishCreate = releaseCreate
  if (finishCreate === undefined) {
    throw new Error('missing create resolver')
  }
  finishCreate()
  await createGate
})
