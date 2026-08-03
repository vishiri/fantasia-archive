import { flushPromises } from '@vue/test-utils'
import { computed, ref, watch } from 'vue'
import { expect, test, vi } from 'vitest'

import { createUseFaProjectWorldColorPaletteFromBridge } from '../functions/createUseFaProjectWorldColorPaletteFromBridge'

test('Test that createUseFaProjectWorldColorPaletteFromBridge loads palettes when a project is active', async () => {
  const aggregateFaProjectWorldColorPaletteHexList = vi.fn(() => ['#112233'])
  const listWorldColorPaletteStrings = vi.fn(async () => ['#112233;#445566'])

  const usePalette = createUseFaProjectWorldColorPaletteFromBridge({
    aggregateFaProjectWorldColorPaletteHexList,
    computed,
    getActiveProjectId: () => 'project-1',
    listWorldColorPaletteStrings,
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

  expect(listWorldColorPaletteStrings).toHaveBeenCalledTimes(1)
  expect(aggregateFaProjectWorldColorPaletteHexList).toHaveBeenCalledWith(['#112233;#445566'])
  expect(paletteHexList.value).toEqual(['#112233'])
})

test('Test that createUseFaProjectWorldColorPaletteFromBridge skips refresh when disabled', async () => {
  const listWorldColorPaletteStrings = vi.fn(async () => ['#112233'])

  const usePalette = createUseFaProjectWorldColorPaletteFromBridge({
    aggregateFaProjectWorldColorPaletteHexList: () => ['#112233'],
    computed,
    getActiveProjectId: () => 'project-1',
    listWorldColorPaletteStrings,
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

  expect(listWorldColorPaletteStrings).not.toHaveBeenCalled()
})

test('Test that createUseFaProjectWorldColorPaletteFromBridge reloads when the active project changes', async () => {
  const projectId = ref<string | null>(null)
  const listWorldColorPaletteStrings = vi.fn(async () => ['#112233;#445566'])

  const usePalette = createUseFaProjectWorldColorPaletteFromBridge({
    aggregateFaProjectWorldColorPaletteHexList: (strings) => strings.flatMap((value) => value.split(';')),
    computed,
    getActiveProjectId: () => projectId.value,
    listWorldColorPaletteStrings,
    ref,
    watch
  })

  const { paletteHexList } = usePalette({ enabled: computed(() => true) })

  projectId.value = 'project-1'
  await flushPromises()

  expect(listWorldColorPaletteStrings).toHaveBeenCalledTimes(1)
  expect(paletteHexList.value).toEqual(['#112233', '#445566'])
})

test('Test that createUseFaProjectWorldColorPaletteFromBridge clears palettes without an active project', async () => {
  const listWorldColorPaletteStrings = vi.fn(async () => ['#112233'])

  const usePalette = createUseFaProjectWorldColorPaletteFromBridge({
    aggregateFaProjectWorldColorPaletteHexList: () => [],
    computed,
    getActiveProjectId: () => null,
    listWorldColorPaletteStrings,
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

  expect(listWorldColorPaletteStrings).not.toHaveBeenCalled()
  expect(paletteHexList.value).toEqual([])
})
