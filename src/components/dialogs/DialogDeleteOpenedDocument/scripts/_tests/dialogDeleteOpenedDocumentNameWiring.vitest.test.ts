import { expect, test, vi } from 'vitest'

import {
  readDeleteDialogDocumentDisplayName,
  reportDeleteDialogDocumentNameReadError
} from '../dialogDeleteOpenedDocumentNameWiring'

test('Test that delete dialog name read returns null without a document reader', async () => {
  vi.stubGlobal('window', {})
  await expect(readDeleteDialogDocumentDisplayName('doc-1')).resolves.toBeNull()
  vi.unstubAllGlobals()
})

test('Test that delete dialog name read returns a trimmed display name', async () => {
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        getDocumentById: vi.fn(async () => ({
          displayName: '  Hero  '
        }))
      }
    }
  })
  await expect(readDeleteDialogDocumentDisplayName('doc-1')).resolves.toBe('Hero')
  vi.unstubAllGlobals()
})

test('Test that delete dialog name read returns null for a blank display name', async () => {
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        getDocumentById: vi.fn(async () => ({
          displayName: '   '
        }))
      }
    }
  })
  await expect(readDeleteDialogDocumentDisplayName('doc-1')).resolves.toBeNull()
  vi.unstubAllGlobals()
})

test('Test that delete dialog name read returns null when the document row is missing', async () => {
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        getDocumentById: vi.fn(async () => {
          throw new Error('Document not found: doc-1')
        })
      }
    }
  })
  await expect(readDeleteDialogDocumentDisplayName('doc-1')).resolves.toBeNull()
  vi.unstubAllGlobals()
})

test('Test that delete dialog name read throws when the document read fails', async () => {
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        getDocumentById: vi.fn(async () => {
          throw new Error('database locked')
        })
      }
    }
  })
  await expect(readDeleteDialogDocumentDisplayName('doc-1')).rejects.toThrow('database locked')
  vi.unstubAllGlobals()
})

test('Test that delete dialog name read errors are reported', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  reportDeleteDialogDocumentNameReadError(new Error('database locked'))
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()
})
