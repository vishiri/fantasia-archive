/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import ProjectAppControlBarFixedStripLeft from '../ProjectAppControlBarFixedStripLeft.vue'

const qBtnStub = defineComponent({
  inheritAttrs: true,
  emits: ['click'],
  template: `
    <button type="button" class="q-btn-stub" v-bind="$attrs" @click="$emit('click', $event)">
      <slot />
    </button>
  `
})

const qTooltipStub = defineComponent({
  template: '<span class="q-tooltip-stub"><slot /></span>'
})

const qSeparatorStub = defineComponent({
  inheritAttrs: true,
  template: '<hr class="q-separator-stub" v-bind="$attrs" />'
})

const cornerDotStub = defineComponent({
  props: {
    locator: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      required: true
    }
  },
  template: '<span class="corner-dot-stub" :data-test-locator="locator" :data-visible="String(visible)" />'
})

const baseProps = {
  advancedSearchGuideKeybindLabel: null as string | null,
  advancedSearchGuideTooltip: 'Advanced search guide',
  keyboardShortcutsKeybindLabel: null as string | null,
  keyboardShortcutsTooltip: 'Keyboard shortcuts',
  onAdvancedSearchGuideClick: vi.fn(),
  onKeyboardShortcutsClick: vi.fn(),
  onQuickAddClick: vi.fn(),
  onQuickSearchClick: vi.fn(),
  onTipsTricksTriviaClick: vi.fn(),
  onToggleAppNoteboardClick: vi.fn(),
  onToggleHierarchyTreeClick: vi.fn(),
  onToggleProjectNoteboardClick: vi.fn(),
  quickAddTooltip: 'Quick add',
  quickSearchTooltip: 'Quick search',
  showAppNoteboardContentDot: false,
  showContentButtons: true,
  showFunctionButtons: true,
  showGuideButtons: true,
  showProjectNoteboardContentDot: false,
  tipsTricksTriviaTooltip: 'Tips',
  toggleAppNoteboardKeybindLabel: null as string | null,
  toggleAppNoteboardTooltip: 'Toggle app noteboard',
  toggleHierarchyTreeKeybindLabel: null as string | null,
  toggleHierarchyTreeTooltip: 'Toggle tree',
  toggleProjectNoteboardKeybindLabel: null as string | null,
  toggleProjectNoteboardTooltip: 'Toggle project noteboard'
}

const mountGlobal = {
  stubs: {
    FaCornerContentDot: cornerDotStub,
    QBtn: qBtnStub,
    QSeparator: qSeparatorStub,
    QTooltip: qTooltipStub
  }
}

/**
 * ProjectAppControlBarFixedStripLeft
 * Renders guide, function, and content button groups when show flags are on.
 */
test('Test that ProjectAppControlBarFixedStripLeft renders visible button groups', () => {
  const wrapper = mount(ProjectAppControlBarFixedStripLeft, {
    props: baseProps,
    global: mountGlobal
  })

  expect(wrapper.find('[data-test-locator="projectAppControlBar-keyboardShortcutsButton"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-toggleHierarchyTreeButton"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-quickSearchButton"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-leftGuidesSeparator"]').exists()).toBe(true)

  wrapper.unmount()
})

/**
 * ProjectAppControlBarFixedStripLeft
 * Delegates guide and function button clicks to injected handlers.
 */
test('Test that ProjectAppControlBarFixedStripLeft wires left strip button clicks', async () => {
  vi.mocked(baseProps.onKeyboardShortcutsClick).mockReset()
  vi.mocked(baseProps.onToggleHierarchyTreeClick).mockReset()
  vi.mocked(baseProps.onToggleAppNoteboardClick).mockReset()

  const wrapper = mount(ProjectAppControlBarFixedStripLeft, {
    props: {
      ...baseProps,
      showAppNoteboardContentDot: true
    },
    global: mountGlobal
  })

  await wrapper.get('[data-test-locator="projectAppControlBar-keyboardShortcutsButton"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-toggleHierarchyTreeButton"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-toggleAppNoteboardButton"]').trigger('click')

  expect(baseProps.onKeyboardShortcutsClick).toHaveBeenCalledTimes(1)
  expect(baseProps.onToggleHierarchyTreeClick).toHaveBeenCalledTimes(1)
  expect(baseProps.onToggleAppNoteboardClick).toHaveBeenCalledTimes(1)
  expect(
    wrapper.find('[data-test-locator="projectAppControlBar-toggleAppNoteboardButton-contentDot"]').attributes('data-visible')
  ).toBe('true')

  wrapper.unmount()
})

/**
 * ProjectAppControlBarFixedStripLeft
 * Hides guide buttons when showGuideButtons is false.
 */
test('Test that ProjectAppControlBarFixedStripLeft hides guides when showGuideButtons is false', () => {
  const wrapper = mount(ProjectAppControlBarFixedStripLeft, {
    props: {
      ...baseProps,
      showGuideButtons: false
    },
    global: mountGlobal
  })

  expect(wrapper.find('[data-test-locator="projectAppControlBar-keyboardShortcutsButton"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-toggleHierarchyTreeButton"]').exists()).toBe(true)

  wrapper.unmount()
})
