/** @vitest-environment node */
import { expect, test, vi } from 'vitest'

/**
 * faProjectDocumentTemplatesFetchFreshForDialog
 * Throws when window is undefined (non-browser environments).
 */
test('Test that faProjectDocumentTemplatesFetchFreshForDialog throws when window is undefined', async () => {
  vi.resetModules()
  const { faProjectDocumentTemplatesFetchFreshForDialog } = await import('../sFaProjectDocumentTemplatesBridge')
  await expect(faProjectDocumentTemplatesFetchFreshForDialog()).rejects.toThrow(
    'projectContent.listDocumentTemplatesForProjectSettings is unavailable'
  )
})
