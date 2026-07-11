import { mount } from '@vue/test-utils'
import { beforeEach, expect, test, vi } from 'vitest'

const pickRandomTipCaptionMock = vi.hoisted(() => {
  return vi.fn(() => 'Fixture tip text.')
})

const {
  showMascotInTipCardRef,
  showTipCardRef
} = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    showMascotInTipCardRef: ref(true),
    showTipCardRef: ref(true)
  }
})

vi.mock('../scripts/projectOverview_manager', () => {
  return {
    useProjectOverview: () => {
      return {
        projectDisplayName: 'Fixture Project',
        randomTipCaption: pickRandomTipCaptionMock(),
        showMascotInTipCard: showMascotInTipCardRef.value,
        showTipCard: showTipCardRef.value
      }
    }
  }
})

vi.mock('app/src/components/elements/FantasiaMascotImage/FantasiaMascotImage.vue', () => {
  return {
    default: {
      name: 'FantasiaMascotImageStub',
      props: ['fantasiaImage'],
      template: '<div data-test-locator="fantasiaMascotImage-stub" />'
    }
  }
})

import ProjectOverview from '../ProjectOverview.vue'

const mountGlobal = {
  mocks: {
    $t: (key: string) => key
  },
  stubs: {
    QIcon: {
      template: '<span class="q-icon-stub projectOverview__hintIcon" />'
    }
  }
}

beforeEach(() => {
  showTipCardRef.value = true
  showMascotInTipCardRef.value = true
})

/**
 * ProjectOverview
 * Renders the overview subtitle, project title, and tip card chrome.
 */
test('Test that ProjectOverview renders subtitle, project name, and tip card', () => {
  const wrapper = mount(ProjectOverview, {
    global: mountGlobal
  })

  expect(wrapper.find('[data-test-locator=projectOverview-subtitle]').text()).toBe(
    'projectUI.projectOverview.projectOverviewFor'
  )
  expect(wrapper.find('[data-test-locator=projectOverview-projectName]').text()).toBe(
    'Fixture Project'
  )
  expect(wrapper.find('[data-test-locator=projectOverview-tipCard]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator=projectOverview-tipHeading]').text()).toBe(
    'globalFunctionality.unsortedAppTexts.didYouKnow'
  )
  expect(wrapper.find('[data-test-locator=projectOverview-tipMessage]').text()).toBe(
    'Fixture tip text.'
  )
  expect(wrapper.find('[data-test-locator=fantasiaMascotImage-stub]').exists()).toBe(true)

  wrapper.unmount()
})

/**
 * ProjectOverview
 * Hides tip card when showTipCard is false.
 */
test('Test that ProjectOverview hides tip card when showTipCard is false', () => {
  showTipCardRef.value = false

  const wrapper = mount(ProjectOverview, {
    global: mountGlobal
  })

  expect(wrapper.find('[data-test-locator=projectOverview-tipCard]').exists()).toBe(false)

  wrapper.unmount()
})

/**
 * ProjectOverview
 * Renders help icon instead of mascot when mascot is disabled.
 */
test('Test that ProjectOverview renders help icon when mascot is disabled', () => {
  showMascotInTipCardRef.value = false

  const wrapper = mount(ProjectOverview, {
    global: mountGlobal
  })

  expect(wrapper.find('[data-test-locator=fantasiaMascotImage-stub]').exists()).toBe(false)
  expect(wrapper.find('.projectOverview__hintIcon').exists()).toBe(true)

  wrapper.unmount()
})
