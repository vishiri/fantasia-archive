/** @vitest-environment node */
import { expect, test } from 'vitest'

import { faProjectDocumentTemplatesFetchFreshForDialog } from '../sFaProjectDocumentTemplatesBridge'

/**
 * faProjectDocumentTemplatesFetchFreshForDialog
 * Throws when window is undefined (non-browser environments).
 */
test('Test that faProjectDocumentTemplatesFetchFreshForDialog throws when window is undefined', async () => {
  await expect(faProjectDocumentTemplatesFetchFreshForDialog()).rejects.toThrow(
    'projectContent.listDocumentTemplatesForProjectSettings is unavailable'
  )
})
