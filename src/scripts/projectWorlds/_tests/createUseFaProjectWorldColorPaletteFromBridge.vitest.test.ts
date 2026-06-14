import { flushPromises } from '@vue/test-utils'
import { computed, ref, watch } from 'vue'
import { expect, test, vi } from 'vitest'

import { createUseFaProjectWorldColorPaletteFromBridge } from '../functions/createUseFaProjectWorldColorPaletteFromBridge'

test('Test that createUseFaProjectWorldColorPaletteFromBridge loads palettes when a project is active', async () => {
  const aggregateFaProjectWorldColorPalleteHexList = vi.fn(() => ['#112233'])
  const listWorldColorPalleteStrings = vi.fn(async () => ['#112233;#445566'])

  const usePalette = createUseFaProjectWorldColorPaletteFromBridge({
    aggregateFaProjectWorldColorPalleteHexList,
    computed,
    getActiveProjectId: () => 'project-1',
    listWorldColorPalleteStrings,
    ref,
    watch: (source, callback, options) => {
      if (options?.immediate === true) {
        callback()
      }
      return () => {
        void source()
      }
    }
  })

  const enabled = computed(() => true)
  const { paletteHexList } = usePalette({ enabled })

  await Promise.resolve()

  expect(listWorldColorPalleteStrings).toHaveBeenCalledTimes(1)
  expect(aggregateFaProjectWorldColorPalleteHexList).toHaveBeenCalledWith(['#112233;#445566'])
  expect(paletteHexList.value).toEqual(['#112233'])
})

test('Test that createUseFaProjectWorldColorPaletteFromBridge skips refresh when disabled', async () => {
  const listWorldColorPalleteStrings = vi.fn(async () => ['#112233'])

  const usePalette = createUseFaProjectWorldColorPaletteFromBridge({
    aggregateFaProjectWorldColorPalleteHexList: () => ['#112233'],
    computed,
    getActiveProjectId: () => 'project-1',
    listWorldColorPalleteStrings,
    ref,
    watch: (source, callback, options) => {
      if (options?.immediate === true) {
        callback()
      }
      return () => {
        void source()
      }
    }
  })

  const enabled = computed(() => false)
  usePalette({ enabled })

  await Promise.resolve()

  expect(listWorldColorPalleteStrings).not.toHaveBeenCalled()
})

test('Test that createUseFaProjectWorldColorPaletteFromBridge reloads when the active project changes', async () => {
  const projectId = ref<string | null>(null)
  const listWorldColorPalleteStrings = vi.fn(async () => ['#112233;#445566'])

  const usePalette = createUseFaProjectWorldColorPaletteFromBridge({
    aggregateFaProjectWorldColorPalleteHexList: (strings) => strings.flatMap((value) => value.split(';')),
    computed,
    getActiveProjectId: () => projectId.value,
    listWorldColorPalleteStrings,
    ref,
    watch
  })

  const { paletteHexList } = usePalette({ enabled: computed(() => true) })

  projectId.value = 'project-1'
  await flushPromises()

  expect(listWorldColorPalleteStrings).toHaveBeenCalledTimes(1)
  expect(paletteHexList.value).toEqual(['#112233', '#445566'])
})

test('Test that createUseFaProjectWorldColorPaletteFromBridge clears palettes without an active project', async () => {
  const listWorldColorPalleteStrings = vi.fn(async () => ['#112233'])

  const usePalette = createUseFaProjectWorldColorPaletteFromBridge({
    aggregateFaProjectWorldColorPalleteHexList: () => [],
    computed,
    getActiveProjectId: () => null,
    listWorldColorPalleteStrings,
    ref,
    watch: (source, callback, options) => {
      if (options?.immediate === true) {
        callback()
      }
      return () => {
        void source()
      }
    }
  })

  const enabled = computed(() => true)
  const { paletteHexList } = usePalette({ enabled })

  await Promise.resolve()

  expect(listWorldColorPalleteStrings).not.toHaveBeenCalled()
  expect(paletteHexList.value).toEqual([])
})
