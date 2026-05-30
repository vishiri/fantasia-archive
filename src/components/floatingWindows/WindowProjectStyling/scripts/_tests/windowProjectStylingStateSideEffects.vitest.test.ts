/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated defineComponent harness slices per test */
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, reactive, ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { I_FaMonacoMount } from 'app/types/I_faWindowStylingMonaco'
import * as dialogStore from 'src/stores/S_Dialog'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

import {
  clearProjectStylingLivePreviewAndRefreshFromKv,
  readFaDialogComponentStoreOrNull,
  refreshPersistedProjectStylingAndCloseWindow,
  watchProjectStylingEditorCssLivePreview,
  wireProjectStylingPersistedCssIntoOpenEditor,
  wireProjectStylingWindowOpenFromMenuAndProps
} from '../windowProjectStyling_manager'

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('watchProjectStylingEditorCssLivePreview updates live preview only while the window is open', async () => {
  const styling = S_FaProjectStyling()
  const setSpy = vi.spyOn(styling, 'setCssLivePreview')

  const workingCss = ref('a')
  const windowModel = ref(false)

  const Harness = defineComponent({
    setup () {
      watchProjectStylingEditorCssLivePreview(workingCss, windowModel)

      return () => null
    }
  })

  mount(Harness)

  workingCss.value = 'b'
  await flushPromises()
  expect(setSpy).not.toHaveBeenCalled()

  windowModel.value = true
  await flushPromises()
  expect(setSpy).toHaveBeenLastCalledWith('b')

  const callsBeforeClosedEdit = setSpy.mock.calls.length
  windowModel.value = false
  await flushPromises()
  workingCss.value = 'c'
  await flushPromises()
  expect(setSpy.mock.calls.length).toBe(callsBeforeClosedEdit)
})

test('wireProjectStylingPersistedCssIntoOpenEditor mirrors KV changes while open and skips redundant editor writes', async () => {
  const persisted = ref('old')
  const workingCss = ref('old')

  const setValue = vi.fn()
  const editor = {
    dispose: (): void => {
      //
    },

    focus: (): void => {
      //
    },

    getValue: (): string => '',
    layout: (): void => {
      //
    },

    onDidChangeModelContent: (): {
      dispose: () => void
    } => {
      return {
        dispose: (): void => {
          //
        }
      }
    },

    setValue
  }

  const monacoEditor = ref<typeof editor | null>(editor)
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      wireProjectStylingPersistedCssIntoOpenEditor({
        getPersistedCss: (): string => persisted.value,
        monaco: {
          disposeEditor (): void {
            //
          },

          editor: monacoEditor,
          isLoading: ref(false),
          loadError: ref(null),

          mountInto: async (): Promise<void> => {
            await Promise.resolve()
          }
        },

        windowModel,
        workingCss
      })

      return () => null
    }
  })

  mount(Harness)

  persisted.value = 'new-from-kv'
  await flushPromises()
  expect(workingCss.value).toBe('new-from-kv')
  expect(setValue).toHaveBeenCalledTimes(1)
  expect(setValue).toHaveBeenCalledWith('new-from-kv')

  setValue.mockClear()

  persisted.value = 'steady'
  await flushPromises()
  expect(setValue).toHaveBeenCalledTimes(1)
  expect(workingCss.value).toBe('steady')

  setValue.mockClear()
  persisted.value = 'steady'
  await flushPromises()

  windowModel.value = false

  persisted.value = 'ignored-while-hidden'
  await flushPromises()
  expect(setValue).not.toHaveBeenCalled()
  expect(workingCss.value).toBe('steady')
})

test('wireProjectStylingPersistedCssIntoOpenEditor updates workingCss when the editor mount is unavailable', async () => {
  const persisted = ref('x')
  const workingCss = ref('x')

  const monacoEditor = ref<{ setValue: (value: string) => void } | null>(null)
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      wireProjectStylingPersistedCssIntoOpenEditor({
        getPersistedCss: (): string => persisted.value,
        monaco: {
          disposeEditor (): void {
            //
          },

          editor: monacoEditor,
          isLoading: ref(false),
          loadError: ref(null),

          mountInto: async (): Promise<void> => {
            await Promise.resolve()
          }
        } as unknown as I_FaMonacoMount,

        windowModel,
        workingCss
      })

      return () => null
    }
  })

  mount(Harness)

  persisted.value = 'y'

  await flushPromises()

  expect(workingCss.value).toBe('y')
})

test('refreshPersistedProjectStylingAndCloseWindow refreshes from KV then clears overlay and shuts the frame', async () => {
  const styling = S_FaProjectStyling()
  vi.spyOn(styling, 'clearCssLivePreview')
  const refresh = vi.spyOn(styling, 'refreshProjectStyling').mockResolvedValue(true)

  const windowModel = ref(true)

  await refreshPersistedProjectStylingAndCloseWindow(windowModel)

  expect(refresh).toHaveBeenCalled()
  expect(styling.clearCssLivePreview).toHaveBeenCalled()
  expect(windowModel.value).toBe(false)
})

test('clearProjectStylingLivePreviewAndRefreshFromKv skips KV refresh until there is persisted overlay drift', () => {
  const styling = S_FaProjectStyling()
  const refresh = vi.spyOn(styling, 'refreshProjectStyling')
  const clearPreviewSpy = vi.spyOn(styling, 'clearCssLivePreview')

  clearProjectStylingLivePreviewAndRefreshFromKv(ref(false))
  expect(refresh).not.toHaveBeenCalled()

  styling.setCssLivePreview('draft')
  clearPreviewSpy.mockClear()
  clearProjectStylingLivePreviewAndRefreshFromKv(ref(false))
  expect(clearPreviewSpy).toHaveBeenCalled()
  expect(refresh).toHaveBeenCalledTimes(1)
})

test('clearProjectStylingLivePreviewAndRefreshFromKv refreshes KV when the window hides with overlay text still mirrored', () => {
  const styling = S_FaProjectStyling()

  styling.setCssLivePreview('draft')
  const refresh = vi.spyOn(styling, 'refreshProjectStyling').mockResolvedValue(true)

  clearProjectStylingLivePreviewAndRefreshFromKv(ref(false))

  expect(styling.cssLivePreview).toBe(null)
  expect(refresh).toHaveBeenCalled()
})

test('clearProjectStylingLivePreviewAndRefreshFromKv still refreshes while the floating window stays open without an overlay', () => {
  const styling = S_FaProjectStyling()
  const refresh = vi.spyOn(styling, 'refreshProjectStyling').mockResolvedValue(true)

  clearProjectStylingLivePreviewAndRefreshFromKv(ref(true))

  expect(refresh).toHaveBeenCalled()
})

test('wireProjectStylingWindowOpenFromMenuAndProps reacts to immediate WindowProjectStyling directInput bindings', async () => {
  const openSpy = vi.fn()
  wireProjectStylingWindowOpenFromMenuAndProps({
    openWindow: openSpy,
    props: {
      directInput: 'WindowProjectStyling'
    }
  })

  expect(openSpy).toHaveBeenCalledTimes(1)
})

test('wireProjectStylingWindowOpenFromMenuAndProps runs both watch and mount hooks once for directInput previews', async () => {
  const openSpy = vi.fn()

  const Harness = defineComponent({
    setup () {
      wireProjectStylingWindowOpenFromMenuAndProps({
        openWindow: openSpy,
        props: {
          directInput: 'WindowProjectStyling'
        }
      })

      return () => null
    }
  })

  mount(Harness)
  await flushPromises()
  expect(openSpy).toHaveBeenCalledTimes(2)
})

test('wireProjectStylingWindowOpenFromMenuAndProps opens when Component dialog routing targets WindowProjectStyling', async () => {
  const openSpy = vi.fn()

  wireProjectStylingWindowOpenFromMenuAndProps({
    openWindow: openSpy,
    props: {}
  })

  openSpy.mockClear()

  const dialog = S_DialogComponent()

  dialog.dialogToOpen = 'WindowProjectStyling'
  dialog.generateDialogUUID()

  await flushPromises()

  expect(openSpy).toHaveBeenCalledTimes(1)
})

test('wireProjectStylingWindowOpenFromMenuAndProps respects non-matching dialogs and ignores other direct inputs', async () => {
  const openSpy = vi.fn()

  wireProjectStylingWindowOpenFromMenuAndProps({
    openWindow: openSpy,

    props: {}
  })

  const dialog = S_DialogComponent()

  dialog.dialogToOpen = 'AboutFantasiaArchive'
  dialog.generateDialogUUID()

  await flushPromises()
  expect(openSpy).not.toHaveBeenCalled()
})

test('wireProjectStylingWindowOpenFromMenuAndProps opens when reactive directInput binds late', async () => {
  const openSpy = vi.fn()

  type T_propsReactive = {
    directInput?: T_dialogName
  }

  const propsReactive: T_propsReactive = reactive({})

  wireProjectStylingWindowOpenFromMenuAndProps({
    openWindow: openSpy,
    props: propsReactive
  })

  expect(openSpy).not.toHaveBeenCalled()

  propsReactive.directInput = 'WindowProjectStyling'

  await flushPromises()

  expect(openSpy).toHaveBeenCalledTimes(1)
})

test('watchProjectStylingEditorCssLivePreview ignores css deltas while routed chrome hides', async () => {
  const styling = S_FaProjectStyling()
  const setSpy = vi.spyOn(styling, 'setCssLivePreview')

  const workingCss = ref('muted')
  const windowModel = ref(false)

  const Harness = defineComponent({
    setup () {
      watchProjectStylingEditorCssLivePreview(workingCss, windowModel)

      return () => null
    }
  })

  mount(Harness)

  workingCss.value = 'still-muted'
  await flushPromises()
  expect(setSpy).not.toHaveBeenCalled()
})

test('wireProjectStylingPersistedCssIntoOpenEditor ignores KV churn while routed chrome hides', async () => {
  const persisted = ref('alpha')
  const workingCss = ref('alpha')

  const setValue = vi.fn()
  const editor = {
    dispose: (): void => {
      //
    },

    focus: (): void => {
      //
    },

    getValue: (): string => '',
    layout: (): void => {
      //
    },

    onDidChangeModelContent: (): {
      dispose: () => void
    } => ({
      dispose: (): void => {
        //
      }
    }),

    setValue
  }

  const monacoEditor = ref(editor)
  const windowModel = ref(false)

  mount(
    defineComponent({
      setup () {
        wireProjectStylingPersistedCssIntoOpenEditor({
          getPersistedCss: (): string => persisted.value,

          monaco: {
            disposeEditor (): void {
              //
            },

            editor: monacoEditor,
            isLoading: ref(false),
            loadError: ref(null),

            mountInto: async (): Promise<void> => {
              await Promise.resolve()
            }
          },

          windowModel,
          workingCss
        })

        return () => null
      }
    })
  )

  persisted.value = 'omega'
  await flushPromises()
  expect(workingCss.value).toBe('alpha')
})

test('readFaDialogComponentStoreOrNull returns null when S_DialogComponent throws', () => {
  vi.spyOn(dialogStore, 'S_DialogComponent').mockImplementation(() => {
    throw new Error('dialog facade unavailable')
  })

  expect(readFaDialogComponentStoreOrNull()).toBe(null)
})

test('wireProjectStylingPersistedCssIntoOpenEditor skips when persisted KV matches workingCss on update', async () => {
  const persisted = ref('bootstrap')
  const workingCss = ref('aligned-draft')

  const setValue = vi.fn()
  const editor = {
    dispose: (): void => {
      //
    },

    focus: (): void => {
      //
    },

    getValue: (): string => '',
    layout: (): void => {
      //
    },

    onDidChangeModelContent: (): {
      dispose: () => void
    } => ({
      dispose: (): void => {
        //
      }
    }),

    setValue
  }

  const monacoEditor = ref<typeof editor | null>(editor)
  const windowModel = ref(true)

  mount(
    defineComponent({
      setup () {
        wireProjectStylingPersistedCssIntoOpenEditor({
          getPersistedCss: (): string => persisted.value,
          monaco: {
            disposeEditor (): void {
              //
            },

            editor: monacoEditor,
            isLoading: ref(false),
            loadError: ref(null),

            mountInto: async (): Promise<void> => {
              await Promise.resolve()
            }
          },

          windowModel,
          workingCss
        })

        return () => null
      }
    })
  )

  persisted.value = 'aligned-draft'
  await flushPromises()

  expect(setValue).not.toHaveBeenCalled()
  expect(workingCss.value).toBe('aligned-draft')
})

test('wireProjectStylingPersistedCssIntoOpenEditor skips Monaco writes when KV already matches drafts', async () => {
  const persistedRef = ref('steady-draft')
  const workingCss = ref('steady-draft')

  const setValue = vi.fn()
  const editor = {
    dispose: (): void => {
      //
    },

    focus: (): void => {
      //
    },

    getValue: (): string => '',
    layout: (): void => {
      //
    },

    onDidChangeModelContent: (): {
      dispose: () => void
    } => ({
      dispose: (): void => {
        //
      }
    }),

    setValue
  }

  const monacoEditor = ref<typeof editor | null>(editor)
  const windowModel = ref(true)

  mount(
    defineComponent({
      setup () {
        wireProjectStylingPersistedCssIntoOpenEditor({
          getPersistedCss: (): string => persistedRef.value,
          monaco: {
            disposeEditor (): void {
              //
            },

            editor: monacoEditor,
            isLoading: ref(false),
            loadError: ref(null),

            mountInto: async (): Promise<void> => {
              await Promise.resolve()
            }
          } as unknown as I_FaMonacoMount,

          windowModel,
          workingCss
        })

        return () => null
      }
    })
  )

  persistedRef.value = 'steady-draft'

  await flushPromises()

  expect(setValue).not.toHaveBeenCalled()

  persistedRef.value = 'next-draft'

  await flushPromises()

  expect(setValue).toHaveBeenCalledWith('next-draft')
})
