import { flushPromises, mount } from '@vue/test-utils'
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { expect, test } from 'vitest'

import DialogProgramSettings from '../DialogProgramSettings.vue'

const SEARCH_DEBOUNCE_MS = 300

/**
 * Vitest treats q-* tags as custom elements, so templates never bind Vue listeners on q-input.
 * Register a lightweight QInput stand-in and opt q-input out of isCustomElement so v-model debounce matches production.
 */
const dialogProgramSettingsQInputStub = defineComponent({
  name: 'QInput',
  inheritAttrs: true,
  props: {
    debounce: {
      type: [String, Number],
      default: 0
    },
    modelValue: {
      type: [String, null] as PropType<string | null>,
      default: null
    }
  },
  emits: ['update:modelValue'],
  data (): { debounceTimer: ReturnType<typeof setTimeout> | undefined } {
    return {
      debounceTimer: undefined
    }
  },
  unmounted () {
    if (this.debounceTimer !== undefined) {
      clearTimeout(this.debounceTimer)
    }
  },
  methods: {
    onInput (event: Event) {
      const target = event.target as HTMLInputElement
      const raw = this.debounce
      const parsed = typeof raw === 'string' ? Number.parseInt(raw, 10) : raw
      const wait = typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0 ? parsed : 0
      if (this.debounceTimer !== undefined) {
        clearTimeout(this.debounceTimer)
      }
      if (wait <= 0) {
        this.$emit('update:modelValue', target.value)
        return
      }
      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = undefined
        this.$emit('update:modelValue', target.value)
      }, wait)
    }
  },
  template: '<input v-bind="$attrs" :value="modelValue ?? \'\'" @input="onInput" />'
})

const programSettingsDialogMountOptions = {
  global: {
    components: {
      QInput: dialogProgramSettingsQInputStub
    },
    config: {
      compilerOptions: {
        isCustomElement: (tag: string): boolean => {
          if (tag.toLowerCase() === 'q-input') {
            return false
          }

          return /^q-/i.test(tag)
        }
      }
    },
    mocks: { $t: (k: string) => k }
  }
} as const

/**
 * DialogProgramSettings
 * directInput should open the program settings dialog shell for ProgramSettings input.
 */
test('Test that DialogProgramSettings renders dialog shell for ProgramSettings input', async () => {
  const w = mount(DialogProgramSettings, {
    props: { directInput: 'ProgramSettings' },
    ...programSettingsDialogMountOptions
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogComponent')
  expect(html).toContain('ProgramSettings')
  expect(w.text()).toContain('dialogs.programSettings.title')
  w.unmount()
})

/**
 * DialogProgramSettings
 * A non-empty trimmed search query should surface the full-width search panel and dialog modifier class.
 */
test('Test that DialogProgramSettings shows search overlay panel after debounced non-empty query', async () => {
  const w = mount(DialogProgramSettings, {
    props: { directInput: 'ProgramSettings' },
    ...programSettingsDialogMountOptions
  })

  await flushPromises()

  await w.get('input.dialogProgramSettings__settingsSearchInput').setValue('dark')
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, SEARCH_DEBOUNCE_MS)
  })
  await flushPromises()

  expect(w.get('.dialogComponent').classes()).toContain('hasActiveSearchQuery')
  expect(w.find('[data-test-locator="dialogProgramSettings-searchAllSettingsPanel"]').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogProgramSettings
 * Whitespace-only search should not count as active; overlay and search panel stay absent.
 */
test('Test that DialogProgramSettings ignores whitespace-only settings search after debounce', async () => {
  const w = mount(DialogProgramSettings, {
    props: { directInput: 'ProgramSettings' },
    ...programSettingsDialogMountOptions
  })

  await flushPromises()

  await w.get('input.dialogProgramSettings__settingsSearchInput').setValue('   ')
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, SEARCH_DEBOUNCE_MS)
  })
  await flushPromises()

  expect(w.get('.dialogComponent').classes()).not.toContain('hasActiveSearchQuery')
  expect(w.find('[data-test-locator="dialogProgramSettings-searchAllSettingsPanel"]').exists()).toBe(false)
  w.unmount()
})

/**
 * DialogProgramSettings
 * No matching settings should show the empty-state card with the reading mascot still mounted but visible only in that state.
 */
test('Test that DialogProgramSettings shows reading mascot empty state when search matches nothing', async () => {
  const w = mount(DialogProgramSettings, {
    props: { directInput: 'ProgramSettings' },
    ...programSettingsDialogMountOptions
  })

  await flushPromises()

  await w.get('input.dialogProgramSettings__settingsSearchInput').setValue(
    'zzzzzzzz-no-program-settings-match-zzzz'
  )
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, SEARCH_DEBOUNCE_MS)
  })
  await flushPromises()

  const empty = w.get('[data-test-locator="dialogProgramSettings-searchNoResults"]')
  expect(empty.isVisible()).toBe(true)
  const mascot = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(mascot.attributes('data-test-image')).toBe('reading')
  w.unmount()
})

/**
 * DialogProgramSettings
 * With matches, the empty-state layer stays in the DOM for image reuse but must not be visible.
 */
test('Test that DialogProgramSettings hides empty state visually when search returns matches', async () => {
  const w = mount(DialogProgramSettings, {
    props: { directInput: 'ProgramSettings' },
    ...programSettingsDialogMountOptions
  })

  await flushPromises()

  await w.get('input.dialogProgramSettings__settingsSearchInput').setValue('dark')
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, SEARCH_DEBOUNCE_MS)
  })
  await flushPromises()

  const empty = w.get('[data-test-locator="dialogProgramSettings-searchNoResults"]')
  expect(empty.isVisible()).toBe(false)
  w.unmount()
})
