/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldsPanel from '../DialogProjectSettingsWorldsPanel.vue'
import { createEmptyDialogProjectSettingsWorldTemplateLayoutDraft } from '../scripts/dialogProjectSettingsWorldTemplateLayoutDraft'

const emptyLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()

const worldA = {
  color: '',
  colorPallete: '',
  displayName: 'Alpha',
  documentCount: 0,
  id: '550e8400-e29b-41d4-a716-446655440000',
  templateLayout: emptyLayout
}

const worldB = {
  color: '#aabbcc',
  colorPallete: '',
  displayName: 'Beta',
  documentCount: 2,
  id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  templateLayout: emptyLayout
}

const detailPanelStub = defineComponent({
  props: {
    nameHasError: {
      type: Boolean,
      default: false
    },
    removeDisabled: {
      type: Boolean,
      default: false
    },
    removeDisabledReason: {
      type: String,
      default: null
    },
    world: {
      type: Object,
      required: true
    }
  },
  emits: ['remove', 'update:color', 'update:colorPallete', 'update:displayName'],
  template: `
    <div
      class="dialog-project-settings-worlds-detail-stub"
      :data-test-remove-disabled="String(removeDisabled)"
      :data-test-remove-reason="removeDisabledReason ?? ''"
      :data-test-world-id="world.id"
    >
      <button
        type="button"
        data-test-locator="dialogProjectSettings-worlds-detail-remove"
        @click="$emit('remove')"
      />
      <button
        type="button"
        data-test-locator="dialogProjectSettings-worlds-detail-color"
        @click="$emit('update:color', '#112233')"
      />
      <button
        type="button"
        data-test-locator="dialogProjectSettings-worlds-detail-colorPallete"
        @click="$emit('update:colorPallete', '#112233;#445566')"
      />
      <button
        type="button"
        data-test-locator="dialogProjectSettings-worlds-detail-name"
        @click="$emit('update:displayName', 'Renamed')"
      />
    </div>
  `
})

const tabListStub = defineComponent({
  props: {
    selectedWorldId: {
      type: String,
      default: null
    },
    worlds: {
      type: Array,
      required: true
    }
  },
  emits: ['addWorld', 'select', 'update:worlds'],
  template: `
    <div class="dialog-project-settings-worlds-tab-list-stub">
      <button
        type="button"
        data-test-locator="dialogProjectSettings-worlds-addButton"
        @click="$emit('addWorld')"
      />
      <button
        type="button"
        data-test-locator="dialogProjectSettings-worlds-select-beta"
        @click="$emit('select', '6ba7b810-9dad-11d1-80b4-00c04fd430c8')"
      />
      <button
        type="button"
        data-test-locator="dialogProjectSettings-worlds-reorder"
        @click="$emit('update:worlds', worlds.slice().reverse())"
      />
    </div>
  `
})

function mountWorldsPanel (worlds = [worldA, worldB]) {
  return mount(DialogProjectSettingsWorldsPanel, {
    props: {
      documentTemplates: [],
      worlds
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldsDetailPanel: detailPanelStub,
        DialogProjectSettingsWorldsTabList: tabListStub,
        QSeparator: { template: '<hr />' }
      }
    }
  })
}

/**
 * DialogProjectSettingsWorldsPanel
 * Renders the tab list and detail panel for the selected world.
 */
test('Test that DialogProjectSettingsWorldsPanel renders the worlds panel title', () => {
  const w = mountWorldsPanel()

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-addButton"]').exists()).toBe(true)
  expect(w.find('.dialog-project-settings-worlds-detail-stub').exists()).toBe(true)
})

/**
 * DialogProjectSettingsWorldsPanel
 * Forwards add-world and detail-panel field updates.
 */
test('Test that DialogProjectSettingsWorldsPanel forwards add world and detail updates', async () => {
  const w = mountWorldsPanel()

  await w.find('[data-test-locator="dialogProjectSettings-worlds-addButton"]').trigger('click')
  expect(w.emitted('addWorld')).toBeTruthy()

  await w.find('[data-test-locator="dialogProjectSettings-worlds-detail-remove"]').trigger('click')
  expect(w.emitted('removeWorld')?.[0]).toEqual([worldA.id])

  await w.find('[data-test-locator="dialogProjectSettings-worlds-detail-color"]').trigger('click')
  expect(w.emitted('updateWorldColor')?.[0]).toEqual([worldA.id, '#112233'])

  await w.find('[data-test-locator="dialogProjectSettings-worlds-detail-colorPallete"]').trigger('click')
  expect(w.emitted('updateWorldColorPallete')?.[0]).toEqual([worldA.id, '#112233;#445566'])

  await w.find('[data-test-locator="dialogProjectSettings-worlds-detail-name"]').trigger('click')
  expect(w.emitted('updateWorldDisplayName')?.[0]).toEqual([worldA.id, 'Renamed'])
})

/**
 * DialogProjectSettingsWorldsPanel
 * Switches the detail panel when another tab is selected.
 */
test('Test that DialogProjectSettingsWorldsPanel switches detail selection', async () => {
  const w = mountWorldsPanel()

  await w.find('[data-test-locator="dialogProjectSettings-worlds-select-beta"]').trigger('click')

  expect(w.find('.dialog-project-settings-worlds-detail-stub').attributes('data-test-world-id')).toBe(worldB.id)
})

/**
 * DialogProjectSettingsWorldsPanel
 * Forwards reordered worlds from the tab list.
 */
test('Test that DialogProjectSettingsWorldsPanel forwards reordered worlds', async () => {
  const w = mountWorldsPanel()

  await w.find('[data-test-locator="dialogProjectSettings-worlds-reorder"]').trigger('click')

  expect(w.emitted('update:worlds')?.[0]).toEqual([[worldB, worldA]])
})

/**
 * DialogProjectSettingsWorldsPanel
 * Surfaces remove-disabled reasons for worlds with documents or as the last row.
 */
test('Test that DialogProjectSettingsWorldsPanel resolves remove disabled reasons', async () => {
  const w = mountWorldsPanel([worldA])

  expect(w.find('.dialog-project-settings-worlds-detail-stub').attributes('data-test-remove-disabled')).toBe('true')
  expect(w.find('.dialog-project-settings-worlds-detail-stub').attributes('data-test-remove-reason')).toBe('lastWorld')

  await w.setProps({
    worlds: [worldB]
  })

  expect(w.find('.dialog-project-settings-worlds-detail-stub').attributes('data-test-remove-disabled')).toBe('true')
  expect(w.find('.dialog-project-settings-worlds-detail-stub').attributes('data-test-remove-reason')).toBe('hasDocuments')
})

/**
 * DialogProjectSettingsWorldsPanel
 * Passes the selected world to the detail panel without aggregating palettes across worlds.
 */
test('Test that DialogProjectSettingsWorldsPanel passes the selected world to the detail panel', () => {
  const w = mountWorldsPanel([
    {
      ...worldA,
      colorPallete: '#112233;#445566'
    },
    {
      ...worldB,
      colorPallete: '#aabbcc;#112233'
    }
  ])

  const detail = w.findComponent(detailPanelStub)
  expect(detail.props('world')).toEqual({
    ...worldA,
    colorPallete: '#112233;#445566'
  })
})
