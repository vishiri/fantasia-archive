import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { createFaActionDefinitionHandlersOpenedDocumentTabClipboard } from '../faActionDefinitionHandlersOpenedDocumentTabClipboard'

const copyToClipboardMock = vi.fn(async () => undefined)
const notifyCreateMock = vi.fn()

const sessionState: {
  tabs: I_faOpenedDocumentTab[]
} = {
  tabs: [
    {
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'One',
      templateIcon: 'mdi-feather',
      displayNameDraft: ' One ',
      savedDisplayName: 'One',
      documentTextColorDraft: ' #AABBCC ',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: ' #112233 ',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: false,
      editState: false
    }
  ]
}

const S_FaOpenedDocumentsMock = vi.fn(() => ({
  findTabByDocumentId: (documentId: string) => {
    return sessionState.tabs.find((tab) => tab.documentId === documentId) ?? null
  }
}))

function createHandlers () {
  return createFaActionDefinitionHandlersOpenedDocumentTabClipboard({
    S_FaOpenedDocuments: S_FaOpenedDocumentsMock,
    copyToClipboard: copyToClipboardMock,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    notifyCreate: notifyCreateMock,
    resolveDocumentTabLabelFromOpenedTab: ({ displayNameDraft, tabLabel }) => {
      return displayNameDraft.trim().length > 0 ? displayNameDraft.trim() : tabLabel
    }
  })
}

beforeEach(() => {
  copyToClipboardMock.mockClear()
  notifyCreateMock.mockClear()
  sessionState.tabs[0] = {
    documentId: 'doc-1',
    persistenceState: 'persisted',
    tabLabel: 'One',
    templateIcon: 'mdi-feather',
    displayNameDraft: ' One ',
    savedDisplayName: 'One',
    documentTextColorDraft: ' #AABBCC ',
    savedDocumentTextColor: '',
    documentBackgroundColorDraft: ' #112233 ',
    savedDocumentBackgroundColor: '',
    isCategoryDraft: false,
    savedIsCategory: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    isDeadDraft: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    parentDocumentIdDraft: '',
    savedParentDocumentId: '',
    treeOrderNumberDraft: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
    extraClassesDraft: '',
    savedExtraClasses: '',
    hasUnsavedChanges: false,
    editState: false
  }
})

test('Test that handleCopyOpenedDocumentTabName copies and shows success toast', async () => {
  const { handleCopyOpenedDocumentTabName } = createHandlers()

  const result = await handleCopyOpenedDocumentTabName({ documentId: 'doc-1' })

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

test('Test that handleCopyOpenedDocumentTabTextColor copies and shows success toast', async () => {
  const { handleCopyOpenedDocumentTabTextColor } = createHandlers()

  const result = await handleCopyOpenedDocumentTabTextColor({ documentId: 'doc-1' })

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

test('Test that handleCopyOpenedDocumentTabBackgroundColor copies and shows success toast', async () => {
  const { handleCopyOpenedDocumentTabBackgroundColor } = createHandlers()

  const result = await handleCopyOpenedDocumentTabBackgroundColor({ documentId: 'doc-1' })

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

test('Test that clipboard copy handlers skip when tab is missing or value is empty', async () => {
  const {
    handleCopyOpenedDocumentTabBackgroundColor,
    handleCopyOpenedDocumentTabName,
    handleCopyOpenedDocumentTabTextColor
  } = createHandlers()

  await handleCopyOpenedDocumentTabName({ documentId: 'missing' })
  await handleCopyOpenedDocumentTabTextColor({ documentId: 'missing' })
  await handleCopyOpenedDocumentTabBackgroundColor({ documentId: 'missing' })

  sessionState.tabs[0] = {
    ...sessionState.tabs[0]!,
    displayNameDraft: '   ',
    tabLabel: ''
  }
  await handleCopyOpenedDocumentTabName({ documentId: 'doc-1' })

  sessionState.tabs[0] = {
    ...sessionState.tabs[0]!,
    documentTextColorDraft: '   '
  }
  await handleCopyOpenedDocumentTabTextColor({ documentId: 'doc-1' })

  sessionState.tabs[0] = {
    ...sessionState.tabs[0]!,
    documentBackgroundColorDraft: '   '
  }
  await handleCopyOpenedDocumentTabBackgroundColor({ documentId: 'doc-1' })

  expect(copyToClipboardMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

test('Test that clipboard copy handlers propagate clipboard failures', async () => {
  copyToClipboardMock.mockRejectedValueOnce(new Error('clipboard blocked'))
  const { handleCopyOpenedDocumentTabName } = createHandlers()
  sessionState.tabs[0]!.displayNameDraft = 'One'

  await expect(handleCopyOpenedDocumentTabName({ documentId: 'doc-1' }))
    .rejects.toThrow('clipboard blocked')

  expect(notifyCreateMock).not.toHaveBeenCalled()
})
