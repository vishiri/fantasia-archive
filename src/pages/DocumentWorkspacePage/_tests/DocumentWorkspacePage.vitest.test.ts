import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, expect, test, vi } from 'vitest'

const displayNameModelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Hero')
})
const documentShowsEditFieldsRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(false)
})
const documentShowsPreviewRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(true)
})
const nameFieldLabelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Document name')
})
const previewDisplayNameRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Hero')
})

vi.mock('../scripts/documentWorkspacePage_manager', () => {
  return {
    useDocumentWorkspacePage: () => {
      return {
        displayNameModel: displayNameModelRef,
        documentShowsEditFields: documentShowsEditFieldsRef,
        documentShowsPreview: documentShowsPreviewRef,
        nameFieldLabel: nameFieldLabelRef,
        previewDisplayName: previewDisplayNameRef
      }
    }
  }
})

import DocumentWorkspacePage from '../DocumentWorkspacePage.vue'

beforeEach(() => {
  displayNameModelRef.value = 'Hero'
  documentShowsEditFieldsRef.value = false
  documentShowsPreviewRef.value = true
  nameFieldLabelRef.value = 'Document name'
  previewDisplayNameRef.value = 'Hero'
})

/**
 * DocumentWorkspacePage SFC presence
 */
test('Test that DocumentWorkspacePage SFC is defined', () => {
  expect(DocumentWorkspacePage).toBeTruthy()
})

test('Test that DocumentWorkspacePage renders preview title when edit fields are hidden', async () => {
  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        QInput: {
          props: ['modelValue', 'label'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :value="modelValue" />'
        }
      }
    }
  })
  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-previewTitle"]').text()).toBe('Hero')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-nameInput"]').exists()).toBe(false)

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage renders name input when edit fields are shown', async () => {
  documentShowsPreviewRef.value = false
  documentShowsEditFieldsRef.value = true

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        QInput: {
          props: ['modelValue', 'label'],
          emits: ['update:modelValue'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        }
      }
    }
  })
  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-previewTitle"]').exists()).toBe(false)
  const nameInput = wrapper.get('[data-test-locator="documentWorkspacePage-nameInput"]')
  expect(nameInput.attributes('value')).toBe('Hero')
  await nameInput.setValue('Renamed hero')
  expect(displayNameModelRef.value).toBe('Renamed hero')

  wrapper.unmount()
})
