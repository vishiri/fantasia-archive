import { expect, test, vi } from 'vitest'

import {
  loadDialogQuickSearchDocumentDocumentsForWorld,
  loadDialogQuickSearchDocumentSources,
  readDialogQuickSearchDocumentDisableCloseAfterSelect,
  resolveDialogQuickSearchDocumentPreferredLanguageCode
} from '../dialogQuickSearchDocumentDataWiring'

vi.mock('src/stores/S_FaUserSettings', () => {
  return {
    S_FaUserSettings: () => ({
      settings: {
        disableCloseAfterSelectQuickSearch: true,
        languageCode: 'en-US'
      }
    })
  }
})

/**
 * loadDialogQuickSearchDocumentSources
 */
test('Test that loadDialogQuickSearchDocumentSources returns empty without bridge APIs', async () => {
  delete window.__faComponentTestingQuickSearchDocumentSources
  const previous = window.faContentBridgeAPIs
  // @ts-expect-error test isolation — clear bridge
  window.faContentBridgeAPIs = undefined
  await expect(loadDialogQuickSearchDocumentSources()).resolves.toEqual({
    templates: [],
    worlds: []
  })
  window.faContentBridgeAPIs = previous
})

/**
 * loadDialogQuickSearchDocumentSources / loadDialogQuickSearchDocumentDocumentsForWorld
 */
test('Test that loadDialogQuickSearchDocumentSources prefers component testing probe', async () => {
  window.__faComponentTestingQuickSearchDocumentSources = {
    documents: [{
      displayName: 'Aria',
      documentTextColor: null,
      id: 'doc-a',
      isCategory: false,
      sortOrder: 0,
      templateId: 'tpl-hero',
      worldId: 'world-a'
    }],
    templates: [{
      id: 'tpl-hero',
      icon: 'mdi-account'
    }],
    worlds: [{
      color: '#abc',
      displayNameTranslations: { 'en-US': 'World' },
      id: 'world-a',
      sortOrder: 0
    }]
  }
  await expect(loadDialogQuickSearchDocumentSources()).resolves.toEqual({
    templates: [{
      id: 'tpl-hero',
      icon: 'mdi-account'
    }],
    worlds: [{
      color: '#abc',
      displayNameTranslations: { 'en-US': 'World' },
      id: 'world-a',
      sortOrder: 0
    }]
  })
  await expect(loadDialogQuickSearchDocumentDocumentsForWorld('world-a')).resolves.toEqual([{
    displayName: 'Aria',
    documentTextColor: null,
    id: 'doc-a',
    isCategory: false,
    sortOrder: 0,
    templateId: 'tpl-hero'
  }])
  delete window.__faComponentTestingQuickSearchDocumentSources
})

/**
 * resolveDialogQuickSearchDocumentPreferredLanguageCode /
 * readDialogQuickSearchDocumentDisableCloseAfterSelect
 */
test('Test that QuickSearch data wiring reads user settings flags', () => {
  expect(resolveDialogQuickSearchDocumentPreferredLanguageCode()).toBe('en-US')
  expect(readDialogQuickSearchDocumentDisableCloseAfterSelect()).toBe(true)
})

/**
 * loadDialogQuickSearchDocumentSources / loadDialogQuickSearchDocumentDocumentsForWorld
 * Maps worlds, templates, and documents from project content bridge IPC.
 */
test('Test that loadDialogQuickSearchDocumentSources maps bridge list results', async () => {
  delete window.__faComponentTestingQuickSearchDocumentSources
  window.faContentBridgeAPIs = {
    projectContent: {
      listDocumentTemplatesForProjectSettings: vi.fn(async () => ({
        items: [{
          icon: 'mdi-account',
          id: 'tpl-1',
          titlePluralTranslations: { 'en-US': 'Heroes' },
          titleSingularTranslations: { 'en-US': 'Hero' }
        }]
      })),
      listDocuments: vi.fn(async () => ({
        items: [{
          createdAtMs: 1700,
          displayName: 'Aria',
          documentTextColor: '#ff0000',
          id: 'doc-1',
          isCategory: false,
          sortOrder: 0,
          templateId: 'tpl-1'
        }]
      })),
      listWorldsForProjectSettings: vi.fn(async () => ({
        items: [{
          color: '#ff5722',
          displayNameTranslations: { 'en-US': 'Main' },
          id: 'world-1',
          sortOrder: 0
        }]
      }))
    }
  } as unknown as typeof window.faContentBridgeAPIs

  await expect(loadDialogQuickSearchDocumentSources()).resolves.toEqual({
    templates: [{
      icon: 'mdi-account',
      id: 'tpl-1'
    }],
    worlds: [{
      color: '#ff5722',
      displayNameTranslations: { 'en-US': 'Main' },
      id: 'world-1',
      sortOrder: 0
    }]
  })
  await expect(loadDialogQuickSearchDocumentDocumentsForWorld('world-1')).resolves.toEqual([{
    createdAtMs: 1700,
    displayName: 'Aria',
    documentTextColor: '#ff0000',
    id: 'doc-1',
    isCategory: false,
    sortOrder: 0,
    templateId: 'tpl-1'
  }])
})

/**
 * loadDialogQuickSearchDocumentSources
 * Empty template icons become the shared file-outline placeholder.
 */
test('Test that loadDialogQuickSearchDocumentSources falls back empty template icons', async () => {
  delete window.__faComponentTestingQuickSearchDocumentSources
  window.faContentBridgeAPIs = {
    projectContent: {
      listDocumentTemplatesForProjectSettings: vi.fn(async () => ({
        items: [{
          icon: '  ',
          id: 'tpl-empty',
          titlePluralTranslations: { 'en-US': 'Blank' },
          titleSingularTranslations: { 'en-US': 'Blank' }
        }]
      })),
      listWorldsForProjectSettings: vi.fn(async () => ({ items: [] }))
    }
  } as unknown as typeof window.faContentBridgeAPIs

  await expect(loadDialogQuickSearchDocumentSources()).resolves.toEqual({
    templates: [{
      icon: 'mdi-file-outline',
      id: 'tpl-empty'
    }],
    worlds: []
  })
})

/**
 * loadDialogQuickSearchDocumentDocumentsForWorld
 * Returns empty when listDocuments is missing on the bridge.
 */
test('Test that loadDialogQuickSearchDocumentDocumentsForWorld returns empty without listDocuments', async () => {
  delete window.__faComponentTestingQuickSearchDocumentSources
  window.faContentBridgeAPIs = {
    projectContent: {
      listDocumentTemplatesForProjectSettings: vi.fn(async () => ({ items: [] })),
      listWorldsForProjectSettings: vi.fn(async () => ({ items: [] }))
    }
  } as unknown as typeof window.faContentBridgeAPIs

  await expect(loadDialogQuickSearchDocumentDocumentsForWorld('world-1')).resolves.toEqual([])
})
