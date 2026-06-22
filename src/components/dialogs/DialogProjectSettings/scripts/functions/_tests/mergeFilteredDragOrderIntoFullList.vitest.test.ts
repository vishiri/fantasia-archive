import { expect, test } from 'vitest'

import { mergeFilteredDragOrderIntoFullList } from '../mergeFilteredDragOrderIntoFullList'

const itemA = {
  displayName: 'Alpha',
  id: 'a'
}
const itemB = {
  displayName: 'Beta',
  id: 'b'
}
const itemC = {
  displayName: 'Gamma',
  id: 'c'
}
const itemD = {
  displayName: 'Delta',
  id: 'd'
}

test('Test that mergeFilteredDragOrderIntoFullList returns full list when filtered order is unchanged', () => {
  const fullList = [itemA, itemB, itemC, itemD]
  expect(mergeFilteredDragOrderIntoFullList(fullList, [itemA, itemC])).toEqual(fullList)
})

test('Test that mergeFilteredDragOrderIntoFullList reorders only filtered items in full list slots', () => {
  const fullList = [itemA, itemB, itemC, itemD]
  expect(mergeFilteredDragOrderIntoFullList(fullList, [itemC, itemA])).toEqual([
    itemC,
    itemB,
    itemA,
    itemD
  ])
})

test('Test that mergeFilteredDragOrderIntoFullList leaves non-filtered items in place', () => {
  const fullList = [itemA, itemB, itemC, itemD]
  expect(mergeFilteredDragOrderIntoFullList(fullList, [itemD, itemB])).toEqual([
    itemA,
    itemD,
    itemC,
    itemB
  ])
})

test('Test that mergeFilteredDragOrderIntoFullList keeps original item when reorder queue is exhausted', () => {
  const duplicateAFirst = {
    displayName: 'Alpha first',
    id: 'a'
  }
  const duplicateASecond = {
    displayName: 'Alpha second',
    id: 'a'
  }
  const fullList = [duplicateAFirst, itemB, duplicateASecond]
  expect(mergeFilteredDragOrderIntoFullList(fullList, [duplicateASecond])).toEqual([
    duplicateASecond,
    itemB,
    duplicateASecond
  ])
})
