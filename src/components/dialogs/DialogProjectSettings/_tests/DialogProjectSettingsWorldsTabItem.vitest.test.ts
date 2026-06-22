import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldsTabItem from '../DialogProjectSettingsWorldsTabItem.vue'

const worldFixture = {
  color: '',
  colorPallete: '',
  displayNameTranslations: { 'en-US': 'Realm' },
  documentCount: 0,
  templateLayout: {
    groups: [],
    placements: []
  },
  id: '550e8400-e29b-41d4-a716-446655440000'
}

/**
 * DialogProjectSettingsWorldsTabItem
 * Emits select when the tab row is clicked.
 */
test('Test that DialogProjectSettingsWorldsTabItem emits select with the world id', async () => {
  const w = mount(DialogProjectSettingsWorldsTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: false,
      tabHasError: false,
      world: worldFixture
    },
    global: {
      directives: {
        ripple: () => {}
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worlds-tab"]').trigger('click')
  expect(w.emitted('select')?.[0]).toEqual([worldFixture.id])
})

/**
 * DialogProjectSettingsWorldsTabItem
 * Hides the color swatch when the world has no color and shows it when a color is set.
 */
test('Test that DialogProjectSettingsWorldsTabItem shows a color swatch only when the world has a color', () => {
  const withoutColor = mount(DialogProjectSettingsWorldsTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: false,
      tabHasError: false,
      world: worldFixture
    },
    global: {
      directives: {
        ripple: () => {}
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(withoutColor.find('[data-test-locator="dialogProjectSettings-worlds-tabColorSwatch"]').exists()).toBe(false)

  const withColor = mount(DialogProjectSettingsWorldsTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: false,
      tabHasError: false,
      world: {
        ...worldFixture,
        color: '#ff0000'
      }
    },
    global: {
      directives: {
        ripple: () => {}
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const swatch = withColor.find('[data-test-locator="dialogProjectSettings-worlds-tabColorSwatch"]')
  expect(swatch.exists()).toBe(true)
  expect(swatch.attributes('style')).toContain('background-color: rgb(255, 0, 0)')
})

/**
 * DialogProjectSettingsWorldsTabItem
 * Suspends Quasar hover during list drag and marks the dragged tab row.
 */
test('Test that DialogProjectSettingsWorldsTabItem applies drag highlight classes', () => {
  const w = mount(DialogProjectSettingsWorldsTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isBeingDragged: true,
      isListDragging: true,
      isSelected: false,
      tabHasError: false,
      world: worldFixture
    },
    global: {
      directives: {
        ripple: () => {}
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const tab = w.find('[data-test-locator="dialogProjectSettings-worlds-tab"]')
  expect(tab.classes()).toContain('faVerticalDraggableTabs__tab--dragging')
  expect(tab.classes()).not.toContain('q-hoverable')
  expect(tab.classes()).not.toContain('q-focusable')
})

/**
 * DialogProjectSettingsWorldsTabItem
 * Shows validation error styling on the tab label when the name is invalid.
 */
test('Test that DialogProjectSettingsWorldsTabItem marks invalid names on the tab', () => {
  const w = mount(DialogProjectSettingsWorldsTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: false,
      tabHasError: true,
      world: {
        ...worldFixture,
        displayNameTranslations: { 'en-US': '   ' }
      }
    },
    global: {
      directives: {
        ripple: () => {}
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-tab"]').attributes('data-test-validation-error')
  ).toBe('true')
})

/**
 * DialogProjectSettingsWorldsTabItem
 * Shows validation error styling when the world palette has duplicate colors.
 */
test('Test that DialogProjectSettingsWorldsTabItem marks duplicate palette errors on the tab', () => {
  const w = mount(DialogProjectSettingsWorldsTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: true,
      tabHasError: true,
      world: {
        ...worldFixture,
        colorPallete: '#112233;#112233'
      }
    },
    global: {
      directives: {
        ripple: () => {}
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const tab = w.find('[data-test-locator="dialogProjectSettings-worlds-tab"]')
  expect(tab.attributes('data-test-validation-error')).toBe('true')
  expect(tab.classes()).toContain('faVerticalDraggableTabs__tab--error')
})

/**
 * DialogProjectSettingsWorldsTabItem
 * Selects the world when Enter or Space is pressed on the tab.
 */
test('Test that DialogProjectSettingsWorldsTabItem selects on Enter and Space keydown', async () => {
  const w = mount(DialogProjectSettingsWorldsTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: false,
      tabHasError: false,
      world: worldFixture
    },
    global: {
      directives: {
        ripple: () => {}
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const tab = w.find('[data-test-locator="dialogProjectSettings-worlds-tab"]')
  await tab.trigger('keydown', { key: 'Enter' })
  expect(w.emitted('select')).toEqual([[worldFixture.id]])

  await tab.trigger('keydown', { key: ' ' })
  expect(w.emitted('select')).toHaveLength(2)

  await tab.trigger('keydown', { key: 'Tab' })
  expect(w.emitted('select')).toHaveLength(2)
})

/**
 * DialogProjectSettingsWorldsTabItem
 * Shows missing translations warning when active locale has no display name.
 */
test('Test that DialogProjectSettingsWorldsTabItem shows missing translations warning for active locale', () => {
  const w = mount(DialogProjectSettingsWorldsTabItem, {
    props: {
      currentLanguageCode: 'de',
      isSelected: false,
      tabHasError: false,
      world: {
        ...worldFixture,
        displayNameTranslations: { 'en-US': 'Realm' }
      }
    },
    global: {
      directives: {
        ripple: () => {}
      },
      mocks: {
        $t: (key: string) => {
          if (key === 'dialogs.projectSettings.panels.worlds.missingTranslationsTabTooltip') {
            return 'Some of the translations for the currently selected language are missing from this world.'
          }
          return key
        }
      },
      stubs: {
        QTooltip: { template: '<span><slot /></span>' }
      }
    }
  })

  const warningIcon = w.find('[data-test-locator="dialogProjectSettings-worlds-tabMissingTranslationsWarning"]')
  expect(warningIcon.exists()).toBe(true)
  expect(warningIcon.attributes('data-test-tooltip-text')).toBe(
    'Some of the translations for the currently selected language are missing from this world.'
  )
})

/**
 * DialogProjectSettingsWorldsTabItem
 * Hides missing translations warning when active locale has a display name.
 */
test('Test that DialogProjectSettingsWorldsTabItem hides missing translations warning when active locale is present', () => {
  const w = mount(DialogProjectSettingsWorldsTabItem, {
    props: {
      currentLanguageCode: 'de',
      isSelected: false,
      tabHasError: false,
      world: {
        ...worldFixture,
        displayNameTranslations: {
          de: 'Reich',
          'en-US': 'Realm'
        }
      }
    },
    global: {
      directives: {
        ripple: () => {}
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-tabMissingTranslationsWarning"]').exists()).toBe(false)
})
