import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

const pickRandomTipCaptionMock = vi.hoisted(() => {
  return vi.fn(() => 'Fixture tip text.')
})

vi.mock('../scripts/projectOverview_manager', () => {
  return {
    useProjectOverview: () => {
      return {
        projectDisplayName: 'Fixture Project',
        randomTipCaption: pickRandomTipCaptionMock(),
        showMascotInTipCard: true,
        showTipCard: true
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

/**
 * ProjectOverview
 * Renders the overview subtitle, project title, and tip card chrome.
 */
test('Test that ProjectOverview renders subtitle, project name, and tip card', () => {
  const wrapper = mount(ProjectOverview, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
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
