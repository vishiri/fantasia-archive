import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_faProjectWorkspaceWorldListItem } from 'app/types/I_faProjectWorkspaceWorldsDomain'

import { createUseProjectWorkspaceWorldList } from '../../functions/createUseProjectWorkspaceWorldList'

test('Test that createUseProjectWorkspaceWorldList exposes workspace world list items from the store', () => {
  const worldListItems = ref<readonly I_faProjectWorkspaceWorldListItem[]>([
    {
      displayName: 'Alpha',
      id: 'world-a'
    }
  ])

  const api = createUseProjectWorkspaceWorldList({
    S_FaProjectWorkspaceWorlds: () => ({}) as never,
    storeToRefs: () => ({
      worldListItems
    }) as never
  })()

  expect(api.worldListItems).toBe(worldListItems)
  expect(api.worldListItems.value).toEqual([
    {
      displayName: 'Alpha',
      id: 'world-a'
    }
  ])
})
