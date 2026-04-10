import { ref } from 'vue'
import { expect, test } from 'vitest'

import { useDialogProgramSettingsSearchComputed } from 'app/src/components/dialogs/DialogProgramSettings/scripts/dialogProgramSettingsSearchComputed'
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'

/**
 * useDialogProgramSettingsSearchComputed
 * Emits an empty filtered tree until the search field has non-whitespace text.
 */
test('search filtered tree stays empty when search query is blank', () => {
  const programSettingsTree = ref<T_programSettingsRenderTree>({
    cat: {
      subCategories: {},
      title: 'Cat'
    }
  })
  const searchSettingsQuery = ref<string | null>('   ')

  const c = useDialogProgramSettingsSearchComputed({
    programSettingsTree,
    searchSettingsQuery
  })

  expect(c.hasActiveSearchQuery.value).toBe(false)
  expect(c.searchFilteredProgramSettingsTree.value).toEqual({})
  expect(c.hasSearchNoMatchingSettings.value).toBe(false)
})

/**
 * useDialogProgramSettingsSearchComputed
 * Marks no-results when search is active and the filtered tree has no categories.
 */
test('hasSearchNoMatchingSettings is true when filter yields empty tree', () => {
  const programSettingsTree = ref<T_programSettingsRenderTree>({
    cat: {
      subCategories: {
        sub: {
          settingsList: {
            onlyKey: {
              description: 'd',
              tags: 't',
              title: 'UniqueTitle',
              value: false
            }
          },
          title: 'Sub'
        }
      },
      title: 'Cat'
    }
  })
  const searchSettingsQuery = ref<string | null>('zzznomatchzzz')

  const c = useDialogProgramSettingsSearchComputed({
    programSettingsTree,
    searchSettingsQuery
  })

  expect(c.hasActiveSearchQuery.value).toBe(true)
  expect(Object.keys(c.searchFilteredProgramSettingsTree.value).length).toBe(0)
  expect(c.hasSearchNoMatchingSettings.value).toBe(true)
})
