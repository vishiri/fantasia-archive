import { expect, test, vi } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { createDocumentWorkspacePageRouteEffects } from '../documentWorkspacePageRouteEffectsWiring'

function computedShim<T> (getter: () => T): I_computedRef<T> {
  return {
    get value () {
      return getter()
    }
  } as I_computedRef<T>
}

function createEffects (input: {
  activeDocumentId: string | null
  documentId?: string
  tabs: ReadonlySet<string>
}) {
  const navigateToWorkspaceHomeRoute = vi.fn(async () => undefined)
  const routeParams: { documentId?: string } = {}
  if (input.documentId !== undefined) {
    routeParams.documentId = input.documentId
  }
  createDocumentWorkspacePageRouteEffects({
    computed: computedShim,
    findTabByDocumentId: (documentId) => {
      if (!input.tabs.has(documentId)) {
        return null
      }
      return { documentId } as I_faOpenedDocumentTab
    },
    hydrationComplete: { value: true },
    navigateToWorkspaceHomeRoute,
    onMounted: (hook) => {
      hook()
    },
    readActiveDocumentId: () => input.activeDocumentId,
    routeParams,
    watch: (_source, effect, options) => {
      if (options?.immediate === true) {
        effect()
      }
    }
  })
  return { navigateToWorkspaceHomeRoute }
}

test('Test that a focused open tab blocks the stale-route home redirect', async () => {
  const { navigateToWorkspaceHomeRoute } = createEffects({
    activeDocumentId: 'doc-2',
    documentId: 'doc-missing',
    tabs: new Set(['doc-2'])
  })
  await Promise.resolve()
  expect(navigateToWorkspaceHomeRoute).not.toHaveBeenCalled()
})

test('Test that a missing route document still redirects home when no other tab has focus', async () => {
  const { navigateToWorkspaceHomeRoute } = createEffects({
    activeDocumentId: null,
    documentId: 'doc-missing',
    tabs: new Set(['doc-2'])
  })
  await Promise.resolve()
  expect(navigateToWorkspaceHomeRoute).toHaveBeenCalled()
})
