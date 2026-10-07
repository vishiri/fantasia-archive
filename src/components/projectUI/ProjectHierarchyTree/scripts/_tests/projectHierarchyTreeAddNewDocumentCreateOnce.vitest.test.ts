import { expect, test, vi } from 'vitest'

vi.mock('app/src/scripts/openedDocuments/reportFaTemporaryDocumentCreateFailureWiring', () => ({
  reportFaTemporaryDocumentCreateFailure: vi.fn()
}))

import { reportFaTemporaryDocumentCreateFailure } from 'app/src/scripts/openedDocuments/reportFaTemporaryDocumentCreateFailureWiring'

import { startProjectHierarchyTreeAddNewDocumentCreate } from '../projectHierarchyTreeAddNewDocumentCreateOnce'

/**
 * startProjectHierarchyTreeAddNewDocumentCreate
 * A failed create toasts and releases the in-flight key so the same row can be tried again.
 */
test('Test that a failed add-new create reports and allows another create', async () => {
  const createError = new Error('Could not create the document.')
  const createTemporaryDocument = vi.fn(async (): Promise<string> => 'temp-doc')
  createTemporaryDocument.mockRejectedValueOnce(createError)
  const input = {
    openMode: 'leftNavigate',
    templateId: 'tpl-fail',
    worldId: 'world-fail'
  }

  startProjectHierarchyTreeAddNewDocumentCreate(createTemporaryDocument, input)
  await vi.waitUntil(() => vi.mocked(reportFaTemporaryDocumentCreateFailure).mock.calls.length === 1)
  expect(reportFaTemporaryDocumentCreateFailure).toHaveBeenCalledWith(createError)

  startProjectHierarchyTreeAddNewDocumentCreate(createTemporaryDocument, input)
  await vi.waitUntil(() => createTemporaryDocument.mock.calls.length === 2)
  expect(reportFaTemporaryDocumentCreateFailure).toHaveBeenCalledTimes(1)
})
