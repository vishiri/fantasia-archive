/** @vitest-environment jsdom */

import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import { useFaProjectWorldColorPaletteFromBridge } from '../faProjectWorldColorPalette_manager'

beforeEach(() => {
  setActivePinia(createPinia())
})

test('Test that useFaProjectWorldColorPaletteFromBridge loads palettes from listWorlds', async () => {
  S_FaActiveProject().setActiveProject({
    filePath: 'C:/Projects/demo.faproject',
    id: 'project-1',
    name: 'Demo'
  })

  const listWorlds = vi.fn(async () => ({
    items: [
      {
        color: '',
        colorPallete: '#112233;#445566',
        createdAtMs: 0,
        displayName: 'Realm',
        id: '550e8400-e29b-41d4-a716-446655440000',
        sortOrder: 0,
        updatedAtMs: 0
      }
    ]
  }))

  window.faContentBridgeAPIs = {
    projectContent: {
      listWorlds
    }
  } as never

  const enabled = computed(() => true)
  const { paletteHexList } = useFaProjectWorldColorPaletteFromBridge({ enabled })

  await flushPromises()

  expect(listWorlds).toHaveBeenCalledTimes(1)
  expect(paletteHexList.value).toEqual([
    '#112233',
    '#445566'
  ])
})

test('Test that useFaProjectWorldColorPaletteFromBridge returns an empty list without listWorlds', async () => {
  S_FaActiveProject().setActiveProject({
    filePath: 'C:/Projects/demo.faproject',
    id: 'project-1',
    name: 'Demo'
  })

  window.faContentBridgeAPIs = {
    projectContent: {}
  } as never

  const enabled = computed(() => true)
  const { paletteHexList } = useFaProjectWorldColorPaletteFromBridge({ enabled })

  await Promise.resolve()

  expect(paletteHexList.value).toEqual([])
})

test('Test that useFaProjectWorldColorPaletteFromBridge skips listWorlds without an active project', async () => {
  const listWorlds = vi.fn(async () => ({ items: [] }))

  window.faContentBridgeAPIs = {
    projectContent: {
      listWorlds
    }
  } as never

  const enabled = computed(() => true)
  const { paletteHexList } = useFaProjectWorldColorPaletteFromBridge({ enabled })

  await flushPromises()

  expect(listWorlds).not.toHaveBeenCalled()
  expect(paletteHexList.value).toEqual([])
})

test('Test that useFaProjectWorldColorPaletteFromBridge returns an empty list without projectContent bridge', async () => {
  S_FaActiveProject().setActiveProject({
    filePath: 'C:/Projects/demo.faproject',
    id: 'project-1',
    name: 'Demo'
  })

  window.faContentBridgeAPIs = undefined as never

  const enabled = computed(() => true)
  const { paletteHexList } = useFaProjectWorldColorPaletteFromBridge({ enabled })

  await flushPromises()

  expect(paletteHexList.value).toEqual([])
})
