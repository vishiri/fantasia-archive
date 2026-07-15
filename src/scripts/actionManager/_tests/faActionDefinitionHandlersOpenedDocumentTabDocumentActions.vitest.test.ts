import { expect, test, vi } from 'vitest'

import { createFaActionDefinitionHandlersOpenedDocumentTabDocumentActions } from '../faActionDefinitionHandlersOpenedDocumentTabDocumentActions'

function createHandlers (input: {
  createTemporaryDocumentCopyFromOpenedTab?: (documentId: string) => Promise<string | null>
  createTemporaryDocumentUnderParentFromOpenedTab?: (documentId: string) => Promise<string | null>
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
    notifyCreate
  })

  return {
    createTemporaryDocumentCopyFromOpenedTab,
    createTemporaryDocumentUnderParentFromOpenedTab,
    handlers,
    notifyCreate
  }
}

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
