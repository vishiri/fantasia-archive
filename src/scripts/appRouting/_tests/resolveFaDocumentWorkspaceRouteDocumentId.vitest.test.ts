import { expect, test } from 'vitest'

import { resolveFaDocumentWorkspaceRouteDocumentId } from '../faAppShellPageTransition_manager'

test('Test that resolveFaDocumentWorkspaceRouteDocumentId parses document workspace routes', () => {
  expect(resolveFaDocumentWorkspaceRouteDocumentId('/home/document/doc-1')).toBe('doc-1')
  expect(resolveFaDocumentWorkspaceRouteDocumentId('/home')).toBeNull()
  expect(resolveFaDocumentWorkspaceRouteDocumentId('/')).toBeNull()
})
