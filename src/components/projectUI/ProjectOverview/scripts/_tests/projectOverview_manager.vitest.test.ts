/* eslint-disable vue/one-component-per-file -- harness components for manager wiring tests */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'
import { defineComponent, h } from 'vue'

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        t: (key: string) => key
      }
    }
  }
})

vi.mock('../projectOverviewPickRandomTipWiring', () => {
  return {
    pickProjectOverviewRandomTipCaption: () => 'Manager-wired tip.'
  }
})

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { useProjectOverview } from '../projectOverview_manager'

beforeEach(() => {
  setActivePinia(createPinia())
})

/**
 * useProjectOverview
 * Manager wiring exposes active project display name and loads a tip on mount.
 */
test('Test that useProjectOverview from the manager reads Pinia and loads a tip', async () => {
  S_FaActiveProject().setActiveProject({
    name: 'Wired Project',
    filePath: 'C:\\fixture.faproject',
    id: 'fixture-id'
  })

  const Harness = defineComponent({
    name: 'ProjectOverviewManagerHarness',
    setup () {
      const state = useProjectOverview()

      return () => h('div', {
        'data-test-locator': 'manager-harness',
        'data-project-name': state.projectDisplayName.value,
        'data-tip-caption': state.randomTipCaption.value
      })
    }
  })

  const wrapper = mount(Harness)

  await wrapper.vm.$nextTick()

  expect(wrapper.attributes('data-project-name')).toBe('Wired Project')
  expect(wrapper.attributes('data-tip-caption')).toBe('Manager-wired tip.')

  wrapper.unmount()
})

/**
 * useProjectOverview
 * Uses the no-project i18n label when Pinia has no active project.
 */
test('Test that useProjectOverview from the manager falls back to the no-project label', async () => {
  const Harness = defineComponent({
    name: 'ProjectOverviewManagerHarnessNoProject',
    setup () {
      const state = useProjectOverview()

      return () => h('div', {
        'data-test-locator': 'manager-harness',
        'data-project-name': state.projectDisplayName.value
      })
    }
  })

  const wrapper = mount(Harness)

  await wrapper.vm.$nextTick()

  expect(wrapper.attributes('data-project-name')).toBe(
    'projectUI.projectOverview.noActiveProjectName'
  )

  wrapper.unmount()
})
