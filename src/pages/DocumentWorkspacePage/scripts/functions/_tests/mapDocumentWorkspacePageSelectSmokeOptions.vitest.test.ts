/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'

import {
  mapDocumentWorkspacePageSelectSmokeDocumentOptions,
  mapDocumentWorkspacePageSelectSmokeTemplateOptions
} from '../mapDocumentWorkspacePageSelectSmokeOptions'

/**
 * mapDocumentWorkspacePageSelectSmokeTemplateOptions
 * Maps template rows to otherType select items with icon when present.
 */
test('Test that mapDocumentWorkspacePageSelectSmokeTemplateOptions maps templates', () => {
  const templates = [
    {
      id: 'tpl-1',
      displayName: 'Characters',
      icon: 'mdi-account'
    },
    {
      id: 'tpl-2',
      displayName: 'Locations',
      icon: ''
    }
  ] as I_faProjectDocumentTemplate[]

  expect(mapDocumentWorkspacePageSelectSmokeTemplateOptions(templates)).toEqual([
    {
      id: 'tpl-1',
      name: 'Characters',
      icon: 'mdi-account',
      otherType: 'documentTemplate'
    },
    {
      id: 'tpl-2',
      name: 'Locations',
      otherType: 'documentTemplate'
    }
  ])
})

/**
 * mapDocumentWorkspacePageSelectSmokeDocumentOptions
 * Maps documents and attaches template icon / documentType when known.
 */
test('Test that mapDocumentWorkspacePageSelectSmokeDocumentOptions maps documents', () => {
  const documents = [
    {
      id: 'doc-1',
      displayName: 'Hero',
      templateId: 'tpl-1'
    },
    {
      id: 'doc-2',
      displayName: 'Orphan',
      templateId: null
    }
  ] as I_faProjectDocument[]

  const icons = new Map([['tpl-1', 'mdi-account']])

  expect(mapDocumentWorkspacePageSelectSmokeDocumentOptions(documents, icons)).toEqual([
    {
      id: 'doc-1',
      name: 'Hero',
      documentType: 'tpl-1',
      icon: 'mdi-account'
    },
    {
      id: 'doc-2',
      name: 'Orphan'
    }
  ])
})
