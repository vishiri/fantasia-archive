import { expect, test } from 'vitest'

import {
  FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
  FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS,
  FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_MS,
  isFaDocumentWorkspaceRoutePath,
  resolveFaAppShellPageTransitionForRouteChange
} from '../faAppShellPageTransition_manager'

test('Test that FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_MS is perceptible for document tab crossfade', () => {
  expect(FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_MS).toBe(150)
})

test('Test that FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS use Vue opacity classes', () => {
  expect(FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS.enterActiveClass).toBe(
    'fa-documentWorkspacePage-enter-active'
  )
  expect(FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS.enterFromClass).toBe(
    'fa-documentWorkspacePage-enter-from'
  )
  expect(FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS.leaveToClass).toBe(
    'fa-documentWorkspacePage-leave-to'
  )
})

test('Test that isFaDocumentWorkspaceRoutePath matches document workspace routes only', () => {
  expect(isFaDocumentWorkspaceRoutePath('/home/document/doc-1')).toBe(true)
  expect(isFaDocumentWorkspaceRoutePath('/home')).toBe(false)
  expect(isFaDocumentWorkspaceRoutePath('/')).toBe(false)
})

test('Test that resolveFaAppShellPageTransitionForRouteChange uses fast fade for document tab switches', () => {
  const resolved = resolveFaAppShellPageTransitionForRouteChange({
    documentWorkspacePageTransitionBindings: FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS,
    fromRoutePath: '/home/document/doc-a',
    shellPageTransitionBindings: FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
    toRoutePath: '/home/document/doc-b'
  })

  expect(resolved.bindings).toBe(FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS)
  expect(resolved.mode).toBe('out-in')
})

test('Test that resolveFaAppShellPageTransitionForRouteChange keeps shell crossfade for welcome and overview changes', () => {
  const resolved = resolveFaAppShellPageTransitionForRouteChange({
    documentWorkspacePageTransitionBindings: FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS,
    fromRoutePath: '/',
    shellPageTransitionBindings: FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
    toRoutePath: '/home'
  })

  expect(resolved.bindings).toBe(FA_APP_SHELL_PAGE_TRANSITION_BINDINGS)
  expect(resolved.mode).toBe('out-in')
})

test('Test that resolveFaAppShellPageTransitionForRouteChange uses fast fade when leaving a document for overview', () => {
  const resolved = resolveFaAppShellPageTransitionForRouteChange({
    documentWorkspacePageTransitionBindings: FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS,
    fromRoutePath: '/home/document/doc-a',
    shellPageTransitionBindings: FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
    toRoutePath: '/home'
  })

  expect(resolved.bindings).toBe(FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS)
  expect(resolved.mode).toBe('out-in')
})

test('Test that resolveFaAppShellPageTransitionForRouteChange uses fast fade when opening a document from overview', () => {
  const resolved = resolveFaAppShellPageTransitionForRouteChange({
    documentWorkspacePageTransitionBindings: FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS,
    fromRoutePath: '/home',
    shellPageTransitionBindings: FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
    toRoutePath: '/home/document/doc-a'
  })

  expect(resolved.bindings).toBe(FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS)
  expect(resolved.mode).toBe('out-in')
})
