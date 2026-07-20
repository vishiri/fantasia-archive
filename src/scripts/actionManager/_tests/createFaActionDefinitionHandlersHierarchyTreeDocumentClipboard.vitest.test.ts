import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createFaActionDefinitionHandlersHierarchyTreeDocumentClipboard } from '../faActionDefinitionHandlersHierarchyTreeDocumentClipboard'

const copyToClipboardMock = vi.fn(async () => undefined)
const notifyCreateMock = vi.fn()

const sessionState: {
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
} = {
  treeData: [
    {
      children: [],
      childrenLoaded: true,
      documentBackgroundColor: ' #112233 ',
      documentId: 'doc-1',
      documentTextColor: ' #AABBCC ',
      groupId: 'group-1',
      hasChildren: false,
      icon: '',
      id: 'doc-1',
      label: ' One ',
      nodeKind: 'document',
      placementId: 'placement-1',
      worldColor: '#000',
      worldId: 'world-1'
    }
  ]
}

const S_FaProjectHierarchyTreeMock = vi.fn(() => ({
  treeData: sessionState.treeData
}))

function createHandlers () {
  return createFaActionDefinitionHandlersHierarchyTreeDocumentClipboard({
    S_FaProjectHierarchyTree: S_FaProjectHierarchyTreeMock,
    copyToClipboard: copyToClipboardMock,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    notifyCreate: notifyCreateMock
  })
}

beforeEach(() => {
  copyToClipboardMock.mockClear()
  notifyCreateMock.mockClear()
  sessionState.treeData = [
    {
      children: [],
      childrenLoaded: true,
      documentBackgroundColor: ' #112233 ',
      documentId: 'doc-1',
      documentTextColor: ' #AABBCC ',
      groupId: 'group-1',
      hasChildren: false,
      icon: '',
      id: 'doc-1',
      label: ' One ',
      nodeKind: 'document',
      placementId: 'placement-1',
      worldColor: '#000',
      worldId: 'world-1'
    }
  ]
})

test('Test that handleCopyHierarchyTreeDocumentName copies and shows success toast', async () => {
  const { handleCopyHierarchyTreeDocumentName } = createHandlers()

  const result = await handleCopyHierarchyTreeDocumentName({ documentId: 'doc-1' })

  expect(copyToClipboardMock).toHaveBeenCalledWith('One')
  expect(notifyCreateMock).toHaveBeenCalledWith({
    color: 'positive',
    faSkipNotifyConsoleLog: true,
    icon: 'mdi-clipboard-check-outline',
    message: 'projectUI.projectAppControlBar.copyNameSuccess',
    timeout: 2500,
    type: 'positive'
  })
  expect(result).toEqual({ payloadPreview: 'One' })
})

test('Test that handleCopyHierarchyTreeDocumentTextColor copies and shows success toast', async () => {
  const { handleCopyHierarchyTreeDocumentTextColor } = createHandlers()

  const result = await handleCopyHierarchyTreeDocumentTextColor({ documentId: 'doc-1' })

  expect(copyToClipboardMock).toHaveBeenCalledWith('#AABBCC')
  expect(notifyCreateMock).toHaveBeenCalledWith({
    color: 'positive',
    faSkipNotifyConsoleLog: true,
    icon: 'mdi-clipboard-check-outline',
    message: 'projectUI.projectAppControlBar.copyTextColorSuccess',
    timeout: 2500,
    type: 'positive'
  })
  expect(result).toEqual({ payloadPreview: '#AABBCC' })
})

test('Test that handleCopyHierarchyTreeDocumentBackgroundColor copies and shows success toast', async () => {
  const { handleCopyHierarchyTreeDocumentBackgroundColor } = createHandlers()

  const result = await handleCopyHierarchyTreeDocumentBackgroundColor({ documentId: 'doc-1' })

  expect(copyToClipboardMock).toHaveBeenCalledWith('#112233')
  expect(notifyCreateMock).toHaveBeenCalledWith({
    color: 'positive',
    faSkipNotifyConsoleLog: true,
    icon: 'mdi-clipboard-check-outline',
    message: 'projectUI.projectAppControlBar.copyBackgroundColorSuccess',
    timeout: 2500,
    type: 'positive'
  })
  expect(result).toEqual({ payloadPreview: '#112233' })
})

test('Test that hierarchy tree clipboard copy handlers skip when node is missing or value is empty', async () => {
  const {
    handleCopyHierarchyTreeDocumentBackgroundColor,
    handleCopyHierarchyTreeDocumentName,
    handleCopyHierarchyTreeDocumentTextColor
  } = createHandlers()

  await handleCopyHierarchyTreeDocumentName({ documentId: 'missing' })
  await handleCopyHierarchyTreeDocumentTextColor({ documentId: 'missing' })
  await handleCopyHierarchyTreeDocumentBackgroundColor({ documentId: 'missing' })

  sessionState.treeData[0] = {
    ...sessionState.treeData[0]!,
    label: '   '
  }
  await handleCopyHierarchyTreeDocumentName({ documentId: 'doc-1' })

  sessionState.treeData[0] = {
    ...sessionState.treeData[0]!,
    documentTextColor: '   '
  }
  await handleCopyHierarchyTreeDocumentTextColor({ documentId: 'doc-1' })

  sessionState.treeData[0] = {
    ...sessionState.treeData[0]!,
    documentBackgroundColor: '   '
  }
  await handleCopyHierarchyTreeDocumentBackgroundColor({ documentId: 'doc-1' })

  expect(copyToClipboardMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

test('Test that hierarchy tree clipboard copy handlers propagate clipboard failures', async () => {
  copyToClipboardMock.mockRejectedValueOnce(new Error('clipboard blocked'))
  const { handleCopyHierarchyTreeDocumentName } = createHandlers()
  sessionState.treeData[0]!.label = 'One'

  await expect(handleCopyHierarchyTreeDocumentName({ documentId: 'doc-1' }))
    .rejects.toThrow('clipboard blocked')

  expect(notifyCreateMock).not.toHaveBeenCalled()
})
