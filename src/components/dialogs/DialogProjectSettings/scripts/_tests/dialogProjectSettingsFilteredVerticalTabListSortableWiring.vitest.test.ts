import { nextTick, ref } from 'vue'
import { expect, test } from 'vitest'

import { createDialogProjectSettingsFilteredVerticalTabListSortableWiring } from '../dialogProjectSettingsFilteredVerticalTabListSortableWiring'

const itemA = {
  displayName: 'Alpha',
  id: 'a'
}
const itemB = {
  displayName: 'Middle',
  id: 'b'
}
const itemC = {
  displayName: 'Gamma',
  id: 'c'
}

function cloneList<T> (list: T[]): T[] {
  return [...list]
}

function filterByDisplayName (
  list: typeof itemA[],
  query: string
): typeof itemA[] {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) {
    return list
  }

  return list.filter((item) => item.displayName.toLowerCase().includes(needle))
}

test('Test that filtered vertical tab list wiring syncs filtered rows into sortable list', async () => {
  const fullList = ref([itemA, itemB, itemC])
  const filterQuery = ref('')

  const wiring = createDialogProjectSettingsFilteredVerticalTabListSortableWiring({
    cloneList,
    filterItems: filterByDisplayName,
    filterQuery,
    fullList
  })

  expect(wiring.sortableList.value).toEqual([itemA, itemB, itemC])

  filterQuery.value = 'a'
  await nextTick()
  expect(wiring.sortableList.value).toEqual([itemA, itemC])
  expect(wiring.showFilterEmpty.value).toBe(false)
})

test('Test that filtered vertical tab list wiring merges filtered drag order back into full list', () => {
  const fullList = ref([itemA, itemB, itemC])
  const filterQuery = ref('a')

  const wiring = createDialogProjectSettingsFilteredVerticalTabListSortableWiring({
    cloneList,
    filterItems: filterByDisplayName,
    filterQuery,
    fullList
  })

  wiring.sortableList.value = [itemC, itemA]
  wiring.applySortableListToFull()

  expect(fullList.value).toEqual([itemC, itemB, itemA])
})

test('Test that filtered vertical tab list wiring reports empty state for no matches', () => {
  const fullList = ref([itemA, itemB, itemC])
  const filterQuery = ref('missing')

  const wiring = createDialogProjectSettingsFilteredVerticalTabListSortableWiring({
    cloneList,
    filterItems: filterByDisplayName,
    filterQuery,
    fullList
  })

  expect(wiring.sortableList.value).toEqual([])
  expect(wiring.showFilterEmpty.value).toBe(true)
})
