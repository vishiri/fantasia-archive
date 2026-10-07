import { expect, test, vi } from 'vitest'

import { createFaActionDefinitionHandlersOpenedDocumentTabDocumentActions } from '../faActionDefinitionHandlersOpenedDocumentTabDocumentActionsWiring'

function createHandlers (input: {
  createTemporaryDocumentCopyFromOpenedTab?: (documentId: string) => Promise<string | null>
  createTemporaryDocumentUnderParentFromOpenedTab?: (documentId: string) => Promise<string | null>
  isProjectReplacementInFlight?: () => boolean
  readProjectContentEpoch?: () => number
} = {}) {
  const createTemporaryDocumentCopyFromOpenedTab =
    input.createTemporaryDocumentCopyFromOpenedTab ?? vi.fn(async () => 'copy-1')
  const createTemporaryDocumentUnderParentFromOpenedTab =
    input.createTemporaryDocumentUnderParentFromOpenedTab ?? vi.fn(async () => 'child-1')
  const notifyCreate = vi.fn()

  const handlers = createFaActionDefinitionHandlersOpenedDocumentTabDocumentActions({
    S_FaOpenedDocuments: () => ({
      createTemporaryDocumentCopyFromOpenedTab,
      createTemporaryDocumentUnderParentFromOpenedTab
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    notifyCreate,
    ...(input.isProjectReplacementInFlight === undefined
      ? {}
      : { isProjectReplacementInFlight: input.isProjectReplacementInFlight }),
    ...(input.readProjectContentEpoch === undefined
      ? {}
      : { readProjectContentEpoch: input.readProjectContentEpoch })
  })

  return {
    createTemporaryDocumentCopyFromOpenedTab,
    createTemporaryDocumentUnderParentFromOpenedTab,
    handlers,
    notifyCreate
  }
}

test('Test that a second opened-tab copy of the same document is ignored while the first copy runs', async () => {
  let releaseCopy: (() => void) | undefined
  const copyGate = new Promise<string>((resolve) => {
    releaseCopy = () => {
      resolve('copy-1')
    }
  })
  const createTemporaryDocumentCopyFromOpenedTab = vi.fn(() => copyGate)
  const { handlers } = createHandlers({
    createTemporaryDocumentCopyFromOpenedTab
  })
  const firstCopy = handlers.handleCopyOpenedDocumentTabDocument({ documentId: 'doc-a' })
  const secondCopy = handlers.handleCopyOpenedDocumentTabDocument({ documentId: 'doc-a' })
  await Promise.resolve()
  expect(createTemporaryDocumentCopyFromOpenedTab).toHaveBeenCalledTimes(1)
  const finishCopy = releaseCopy
  if (finishCopy === undefined) {
    throw new Error('missing copy resolver')
  }
  finishCopy()
  await firstCopy
  await secondCopy
  expect(createTemporaryDocumentCopyFromOpenedTab).toHaveBeenCalledTimes(1)
})

test('Test that handleCopyOpenedDocumentTabDocument delegates to createTemporaryDocumentCopyFromOpenedTab', async () => {
  const { createTemporaryDocumentCopyFromOpenedTab, handlers } = createHandlers()

  const result = await handlers.handleCopyOpenedDocumentTabDocument({ documentId: 'doc-a' })

  expect(createTemporaryDocumentCopyFromOpenedTab).toHaveBeenCalledWith('doc-a')
  expect(result).toEqual({ payloadPreview: 'copy-1' })
})

test('Test that handleCopyOpenedDocumentTabDocument notifies when copy source cannot be duplicated', async () => {
  const { handlers, notifyCreate } = createHandlers({
    createTemporaryDocumentCopyFromOpenedTab: vi.fn(async () => null)
  })

  const result = await handlers.handleCopyOpenedDocumentTabDocument({ documentId: 'doc-a' })

  expect(result).toBeUndefined()
  expect(notifyCreate).toHaveBeenCalledWith({
    message: 'globalFunctionality.faOpenedDocuments.copyDocumentMissingTemplateError',
    type: 'negative'
  })
})

test('Test that handleCopyOpenedDocumentTabDocument stays quiet while a project open is in flight', async () => {
  const { handlers, notifyCreate } = createHandlers({
    createTemporaryDocumentCopyFromOpenedTab: vi.fn(async () => null),
    isProjectReplacementInFlight: () => true,
    readProjectContentEpoch: () => 1
  })

  await handlers.handleCopyOpenedDocumentTabDocument({ documentId: 'doc-a' })

  expect(notifyCreate).not.toHaveBeenCalled()
})

test('Test that handleAddOpenedDocumentTabChildDocument delegates to createTemporaryDocumentUnderParentFromOpenedTab', async () => {
  const { createTemporaryDocumentUnderParentFromOpenedTab, handlers } = createHandlers()

  const result = await handlers.handleAddOpenedDocumentTabChildDocument({ documentId: 'doc-a' })

  expect(createTemporaryDocumentUnderParentFromOpenedTab).toHaveBeenCalledWith('doc-a')
  expect(result).toEqual({ payloadPreview: 'child-1' })
})

test('Test that handleAddOpenedDocumentTabChildDocument notifies when child cannot be created', async () => {
  const { handlers, notifyCreate } = createHandlers({
    createTemporaryDocumentUnderParentFromOpenedTab: vi.fn(async () => null)
  })

  const result = await handlers.handleAddOpenedDocumentTabChildDocument({ documentId: 'doc-a' })

  expect(result).toBeUndefined()
  expect(notifyCreate).toHaveBeenCalledWith({
    message: 'globalFunctionality.faOpenedDocuments.copyDocumentMissingTemplateError',
    type: 'negative'
  })
})
