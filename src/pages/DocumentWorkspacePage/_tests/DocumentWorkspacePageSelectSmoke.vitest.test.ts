/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import DocumentWorkspacePageSelectSmoke from '../DocumentWorkspacePageSelectSmoke.vue'

const templateItem = {
  id: 'tpl-1',
  displayName: 'Characters',
  icon: 'mdi-account',
  titlePluralTranslations: {},
  titleSingularTranslations: {},
  sortOrder: 0,
  worldAppendix: '',
  worldAppendixTranslations: {},
  createdAtMs: 0,
  updatedAtMs: 0
}

const documentItem = {
  id: 'doc-1',
  worldId: 'world-1',
  templateId: 'tpl-1',
  placementId: null,
  parentDocumentId: null,
  sortOrder: 0,
  displayName: 'Hero',
  documentTextColor: null,
  documentBackgroundColor: null,
  isCategory: false,
  isFinished: false,
  isMinor: false,
  isDead: false,
  treeOrderNumber: 0,
  extraClasses: '',
  createdAtMs: 0,
  updatedAtMs: 0
}

function mountSelectSmoke (props: {
  disable?: boolean
  documentTab: I_faOpenedDocumentTab | null
}, bridge?: {
  listDocumentTemplates: ReturnType<typeof vi.fn>
  listDocuments: ReturnType<typeof vi.fn>
}) {
  const listDocumentTemplates = bridge?.listDocumentTemplates ?? vi.fn(async () => ({
    items: [templateItem]
  }))
  const listDocuments = bridge?.listDocuments ?? vi.fn(async () => ({
    items: [documentItem]
  }))

  Object.assign(window, {
    faContentBridgeAPIs: {
      projectContent: {
        listDocumentTemplates,
        listDocuments
      }
    }
  })

  const wrapper = mount(DocumentWorkspacePageSelectSmoke, {
    global: {
      stubs: {
        FaSelectInput: {
          props: ['testLocator', 'options', 'mode', 'loading', 'modelValue'],
          emits: ['request-options', 'update:modelValue'],
          template: `
            <button
              type="button"
              :data-test-locator="testLocator"
              :data-mode="mode"
              :data-options-count="(options || []).length"
              @click="$emit('request-options'); $emit('update:modelValue', mode === 'simple' ? 'test 1' : { id: 'x', name: 'x' })"
            />
          `
        }
      }
    },
    props: {
      disable: props.disable ?? false,
      documentTab: props.documentTab
    }
  })

  return {
    listDocumentTemplates,
    listDocuments,
    wrapper
  }
}

/**
 * DocumentWorkspacePageSelectSmoke
 * Renders simple, template, and document smoke selects when a tab is present.
 */
test('Test that DocumentWorkspacePageSelectSmoke mounts all smoke select fields', async () => {
  const { wrapper, listDocumentTemplates, listDocuments } = mountSelectSmoke({
    documentTab: { documentId: 'doc-1' } as I_faOpenedDocumentTab
  })

  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmokeMultiSimpleLabel"]').text())
    .toContain('Simple')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmokeSingleSimpleLabel"]').text())
    .toContain('Simple')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmokeMultiTemplate"]').exists())
    .toBe(true)
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmokeSingleDocument"]').exists())
    .toBe(true)
  expect(listDocumentTemplates).toHaveBeenCalled()
  expect(listDocuments).toHaveBeenCalled()

  await wrapper.get('[data-test-locator="documentWorkspacePage-selectSmokeMultiSimple"]').trigger('click')
  await wrapper.get('[data-test-locator="documentWorkspacePage-selectSmokeSingleSimple"]').trigger('click')
  await wrapper.get('[data-test-locator="documentWorkspacePage-selectSmokeMultiTemplate"]').trigger('click')
  await wrapper.get('[data-test-locator="documentWorkspacePage-selectSmokeSingleTemplate"]').trigger('click')
  await wrapper.get('[data-test-locator="documentWorkspacePage-selectSmokeMultiDocument"]').trigger('click')
  await wrapper.get('[data-test-locator="documentWorkspacePage-selectSmokeSingleDocument"]').trigger('click')
  await flushPromises()
})

/**
 * DocumentWorkspacePageSelectSmoke
 * Hides when document tab is null.
 */
test('Test that DocumentWorkspacePageSelectSmoke hides when document tab is null', () => {
  const wrapper = mount(DocumentWorkspacePageSelectSmoke, {
    global: {
      stubs: {
        FaSelectInput: true
      }
    },
    props: {
      disable: true,
      documentTab: null
    }
  })

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmoke"]').exists())
    .toBe(false)
})

/**
 * DocumentWorkspacePageSelectSmoke
 * Clears options when projectContent bridge is missing.
 */
test('Test that DocumentWorkspacePageSelectSmoke clears options without projectContent bridge', async () => {
  Object.assign(window, {
    faContentBridgeAPIs: {}
  })

  const wrapper = mount(DocumentWorkspacePageSelectSmoke, {
    global: {
      stubs: {
        FaSelectInput: {
          props: ['testLocator', 'options'],
          template: '<div :data-test-locator="testLocator" :data-options-count="(options || []).length" />'
        }
      }
    },
    props: {
      disable: false,
      documentTab: { documentId: 'doc-1' } as I_faOpenedDocumentTab
    }
  })

  await flushPromises()
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmokeMultiTemplate"]')
    .attributes('data-options-count')).toBe('0')
})

/**
 * DocumentWorkspacePageSelectSmoke
 * No-ops load when document tab becomes null after mount.
 */
test('Test that DocumentWorkspacePageSelectSmoke skips load when document tab clears', async () => {
  const listDocuments = vi.fn(async () => ({ items: [documentItem] }))
  const listDocumentTemplates = vi.fn(async () => ({ items: [templateItem] }))

  const { wrapper } = mountSelectSmoke(
    { documentTab: { documentId: 'doc-1' } as I_faOpenedDocumentTab },
    {
      listDocumentTemplates,
      listDocuments
    }
  )
  await flushPromises()
  listDocuments.mockClear()

  await wrapper.setProps({ documentTab: null })
  await flushPromises()
  expect(listDocuments).not.toHaveBeenCalled()
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmoke"]').exists())
    .toBe(false)
})

/**
 * DocumentWorkspacePageSelectSmoke
 * Maps templates without icons and documents without templates.
 */
test('Test that DocumentWorkspacePageSelectSmoke maps options without icons or templates', async () => {
  const listDocumentTemplates = vi.fn(async () => ({
    items: [{
      ...templateItem,
      icon: ''
    }]
  }))
  const listDocuments = vi.fn(async () => ({
    items: [{
      ...documentItem,
      templateId: null
    }]
  }))

  const { wrapper } = mountSelectSmoke(
    { documentTab: { documentId: 'doc-1' } as I_faOpenedDocumentTab },
    {
      listDocumentTemplates,
      listDocuments
    }
  )
  await flushPromises()
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmokeMultiTemplate"]')
    .attributes('data-options-count')).toBe('1')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmokeMultiDocument"]')
    .attributes('data-options-count')).toBe('1')
})

/**
 * DocumentWorkspacePageSelectSmoke
 * Catch path empties options when IPC throws; request-options reloads.
 */
test('Test that DocumentWorkspacePageSelectSmoke recovers from list failures and request-options', async () => {
  const listDocumentTemplates = vi.fn()
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValue({ items: [templateItem] })
  const listDocuments = vi.fn()
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValue({ items: [documentItem] })

  const { wrapper } = mountSelectSmoke(
    { documentTab: { documentId: 'doc-1' } as I_faOpenedDocumentTab },
    {
      listDocumentTemplates,
      listDocuments
    }
  )

  await flushPromises()
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmokeMultiTemplate"]')
    .attributes('data-options-count')).toBe('0')

  await wrapper.get('[data-test-locator="documentWorkspacePage-selectSmokeMultiTemplate"]').trigger('click')
  await flushPromises()
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-selectSmokeMultiTemplate"]')
    .attributes('data-options-count')).toBe('1')
})

/**
 * DocumentWorkspacePageSelectSmoke
 * Reloads options when document tab id changes.
 */
test('Test that DocumentWorkspacePageSelectSmoke reloads when documentTab id changes', async () => {
  const listDocumentTemplates = vi.fn(async () => ({ items: [templateItem] }))
  const listDocuments = vi.fn(async () => ({ items: [documentItem] }))

  const { wrapper } = mountSelectSmoke(
    { documentTab: { documentId: 'doc-1' } as I_faOpenedDocumentTab },
    {
      listDocumentTemplates,
      listDocuments
    }
  )
  await flushPromises()
  expect(listDocuments).toHaveBeenCalledTimes(1)

  await wrapper.setProps({
    documentTab: { documentId: 'doc-2' } as I_faOpenedDocumentTab
  })
  await flushPromises()
  expect(listDocuments).toHaveBeenCalledTimes(2)
})
