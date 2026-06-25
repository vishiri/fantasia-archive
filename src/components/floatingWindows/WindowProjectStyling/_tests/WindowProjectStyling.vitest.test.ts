/** @vitest-environment jsdom */
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import projectStyling from 'app/i18n/en-US/floatingWindows/L_projectStyling'

const frameSpies = vi.hoisted(() => {
  return {
    onFramePointerDown: vi.fn(),
    onResizePointerDown: vi.fn(),
    onTitlePointerDown: vi.fn()
  }
})

vi.mock('app/src/scripts/floatingWindows/floatingWindows_manager', async (importOriginal) => {
  const actual = await importOriginal<typeof import('app/src/scripts/floatingWindows/floatingWindows_manager')>()
  return {
    ...actual,
    useFaFloatingWindowFrame: () => ({
      frameRef: ref(null),
      frameStyle: ref({}),
      h: ref(480),
      onFramePointerDown: frameSpies.onFramePointerDown,
      onResizePointerDown: frameSpies.onResizePointerDown,
      onTitlePointerDown: frameSpies.onTitlePointerDown,
      titleShortFrameClass: ref(undefined),
      w: ref(560),
      x: ref(20),
      y: ref(20)
    }),
    useFaFloatingWindowFramePersist: () => undefined
  }
})

const projectStylingMonacoState = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    isLoading: ref(false),
    loadError: ref<string | null>(null)
  }
})

vi.mock('app/src/components/floatingWindows/WindowProjectStyling/scripts/windowProjectStyling_manager', () => ({
  useWindowProjectStylingSurface: () => ({
    FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: {},
    FA_FLOATING_WINDOW_POP_TRANSITION_MS: 300,
    buildFaColorVarSwatchStyle: () => ({ backgroundColor: 'var(--fa-color-primary)' }),
    closeWithoutSaving: vi.fn(),
    documentName: ref('WindowProjectStyling'),
    editorHostRef: ref(null),
    faThemeCustomPropertyNames: ref(['--fa-color-accent']),
    frameRef: ref(null),
    frameStyleWithDialogTransition: ref({}),
    helpKeybindMenuOpen: ref(false),
    monaco: {
      isLoading: projectStylingMonacoState.isLoading,
      loadError: projectStylingMonacoState.loadError
    },
    monacoKeybindHelpItems: ref([
      {
        labelKey: 'commandPalette',
        chord: 'F1'
      }
    ]),
    onFramePointerDown: frameSpies.onFramePointerDown,
    onHelpIconMouseEnter: vi.fn(),
    onHelpIconMouseLeave: vi.fn(),
    onResizePointerDown: frameSpies.onResizePointerDown,
    onTitlePointerDown: frameSpies.onTitlePointerDown,
    saveAndCloseWindow: vi.fn(async () => undefined),
    titleShortFrameClass: ref(undefined),
    windowModel: ref(true)
  })
}))

import WindowProjectStyling from '../WindowProjectStyling.vue'

const windowProjectStylingQMenuStub = defineComponent({
  name: 'QMenu',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  template: '<div class="q-menu-stub" v-bind="$attrs"><slot /></div>'
})

const windowProjectStylingMountStubs = {
  FaFloatingWindowBodyTeleport: {
    template: '<div><slot /></div>'
  },
  QBtn: {
    inheritAttrs: true,
    props: {
      label: {
        default: '',
        type: String
      }
    },
    template: '<button type="button" v-bind="$attrs"><span>{{ label }}</span></button>'
  },
  QCard: { template: '<div><slot /></div>' },
  QCardActions: { template: '<div><slot /></div>' },
  QCardSection: { template: '<div><slot /></div>' },
  QIcon: { template: '<i><slot /></i>' },
  QMenu: windowProjectStylingQMenuStub,
  QSpinnerDots: { template: '<span />' }
}

const injectMinimalFaRootVarsForList = (): void => {
  const s = document.createElement('style')
  s.setAttribute('data-fa-vitest-theme-stub', 'project-styling')
  s.append(
    document.createTextNode(
      [
        ':root {',
        '  --fa-color-accent: 0;',
        '  --fa-color-primary: 0;',
        '  --fa-color-tooltip-background: 0;',
        '}'
      ].join(' ')
    )
  )
  document.head.append(s)
}

beforeEach(() => {
  setActivePinia(createPinia())
  projectStylingMonacoState.isLoading.value = false
  projectStylingMonacoState.loadError.value = null
  injectMinimalFaRootVarsForList()
})

afterEach(() => {
  for (const el of document.querySelectorAll('style[data-fa-vitest-theme-stub="project-styling"]')) {
    el.remove()
  }
})

const stylingT = (k: string): string => {
  if (k === 'floatingWindows.projectStyling.title') {
    return projectStyling.title
  }
  if (k === 'floatingWindows.projectStyling.closeWithoutSaving') {
    return projectStyling.closeWithoutSaving
  }
  if (k === 'floatingWindows.projectStyling.saveButton') {
    return projectStyling.saveButton
  }
  if (k === 'floatingWindows.projectStyling.helpTooltip.aria') {
    return projectStyling.helpTooltip.aria
  }
  if (k === 'floatingWindows.projectStyling.loading') {
    return projectStyling.loading
  }
  if (k === 'floatingWindows.projectStyling.helpTooltip.title') {
    return projectStyling.helpTooltip.title
  }
  if (k === 'floatingWindows.projectStyling.helpTooltip.variableListTitle') {
    return projectStyling.helpTooltip.variableListTitle
  }
  if (k === 'floatingWindows.projectStyling.helpTooltip.footer') {
    return projectStyling.helpTooltip.footer
  }
  if (k.startsWith('floatingWindows.projectStyling.helpTooltip.items.')) {
    const sub = k.replace('floatingWindows.projectStyling.helpTooltip.items.', '')
    const items = projectStyling.helpTooltip.items as Record<string, string>
    return items[sub] ?? k
  }
  return k
}

test('Test that WindowProjectStyling surfaces title and action button locators', () => {
  const w = mount(WindowProjectStyling, {
    global: {
      mocks: { $t: stylingT },
      stubs: windowProjectStylingMountStubs
    }
  })

  expect(w.find('[data-test-locator="windowProjectStyling-title"]').text()).toContain(projectStyling.title)
  expect(w.find('[data-test-locator="windowProjectStyling-button-close"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="windowProjectStyling-button-save"]').exists()).toBe(true)

  const helpBody = w.find('[data-test-locator="windowProjectStyling-helpTooltipBody"]')
  expect(helpBody.exists()).toBe(true)
  expect(helpBody.text()).toContain(projectStyling.helpTooltip.title)
  expect(helpBody.text()).toContain(projectStyling.helpTooltip.items.commandPalette)
  expect(helpBody.find('[data-test-locator="windowProjectStyling-faThemeVarList"]').exists()).toBe(true)
  expect(helpBody.text()).toContain('--fa-color-accent')

  w.unmount()
})

test('Test that WindowProjectStyling forwards frame and title-bar pointerdown handlers', async () => {
  frameSpies.onFramePointerDown.mockClear()
  frameSpies.onTitlePointerDown.mockClear()

  const w = mount(WindowProjectStyling, {
    global: {
      mocks: { $t: stylingT },
      stubs: windowProjectStylingMountStubs
    }
  })

  await w.get('[data-test-locator="windowProjectStyling-frame"]').trigger('pointerdown')
  expect(frameSpies.onFramePointerDown).toHaveBeenCalledTimes(1)

  await w.get('[data-test-locator="windowProjectStyling-dragHandle"]').trigger('pointerdown')
  expect(frameSpies.onTitlePointerDown).toHaveBeenCalledTimes(1)

  w.unmount()
})

test('Test that WindowProjectStyling shows loading and load-error overlays from monaco state', async () => {
  projectStylingMonacoState.isLoading.value = true

  const wLoading = mount(WindowProjectStyling, {
    global: {
      mocks: { $t: stylingT },
      stubs: windowProjectStylingMountStubs
    }
  })

  expect(wLoading.find('[data-test-locator="windowProjectStyling-loadingOverlay"]').exists()).toBe(true)
  expect(wLoading.text()).toContain(projectStyling.loading)
  wLoading.unmount()

  projectStylingMonacoState.isLoading.value = false
  projectStylingMonacoState.loadError.value = 'Monaco failed to load'

  const wError = mount(WindowProjectStyling, {
    global: {
      mocks: { $t: stylingT },
      stubs: windowProjectStylingMountStubs
    }
  })

  expect(wError.find('[data-test-locator="windowProjectStyling-loadError"]').text()).toContain(
    'Monaco failed to load'
  )
  wError.unmount()
})

test('Test that WindowProjectStyling syncs help keybind menu open state', async () => {
  const w = mount(WindowProjectStyling, {
    global: {
      mocks: { $t: stylingT },
      stubs: windowProjectStylingMountStubs
    }
  })

  const helpMenu = w.findComponent({ name: 'QMenu' })
  expect(helpMenu.props('modelValue')).toBe(false)

  await helpMenu.vm.$emit('update:modelValue', true)
  await w.vm.$nextTick()

  expect(helpMenu.props('modelValue')).toBe(true)
  expect(w.find('[data-test-locator="windowProjectStyling-helpMenu"]').exists()).toBe(true)

  w.unmount()
})
