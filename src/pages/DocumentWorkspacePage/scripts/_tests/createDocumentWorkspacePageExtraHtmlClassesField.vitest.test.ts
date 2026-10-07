import { expect, test, vi } from 'vitest'
import { computed } from 'vue'

import { createDocumentWorkspacePageExtraHtmlClassesField } from '../functions/createDocumentWorkspacePageExtraHtmlClassesField'

/**
 * createDocumentWorkspacePageExtraHtmlClassesField
 * A trailing space stays in the draft so the next class token can be typed.
 */
test('Test that createDocumentWorkspacePageExtraHtmlClassesField keeps a trailing space in the draft', () => {
  const updateExtraClassesDraft = vi.fn()
  const api = createDocumentWorkspacePageExtraHtmlClassesField({
    computed,
    documentTab: computed(() => {
      return {
        editState: true,
        extraClassesDraft: 'foo'
      } as never
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    routeDocumentId: computed(() => 'doc-1'),
    updateExtraClassesDraft
  })

  api.extraHtmlClassesModel.value = 'foo '
  expect(updateExtraClassesDraft).toHaveBeenCalledWith('doc-1', 'foo ')
  expect(api.workspacePageExtraHtmlClassList.value).toEqual(['foo'])
})

/**
 * createDocumentWorkspacePageExtraHtmlClassesField
 * Preview mode does not write the extra-classes draft.
 */
test('Test that createDocumentWorkspacePageExtraHtmlClassesField ignores writes in preview', () => {
  const updateExtraClassesDraft = vi.fn()
  const api = createDocumentWorkspacePageExtraHtmlClassesField({
    computed,
    documentTab: computed(() => {
      return {
        editState: false,
        extraClassesDraft: 'foo'
      } as never
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    routeDocumentId: computed(() => 'doc-1'),
    updateExtraClassesDraft
  })

  api.extraHtmlClassesModel.value = 'foo bar'
  expect(updateExtraClassesDraft).not.toHaveBeenCalled()
})

/**
 * createDocumentWorkspacePageExtraHtmlClassesField
 * Missing route document id does not write the extra-classes draft.
 */
test('Test that createDocumentWorkspacePageExtraHtmlClassesField ignores writes without a route id', () => {
  const updateExtraClassesDraft = vi.fn()
  const api = createDocumentWorkspacePageExtraHtmlClassesField({
    computed,
    documentTab: computed(() => {
      return {
        editState: true,
        extraClassesDraft: ''
      } as never
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    routeDocumentId: computed(() => ''),
    updateExtraClassesDraft
  })

  api.extraHtmlClassesModel.value = 'foo'
  expect(updateExtraClassesDraft).not.toHaveBeenCalled()
})
