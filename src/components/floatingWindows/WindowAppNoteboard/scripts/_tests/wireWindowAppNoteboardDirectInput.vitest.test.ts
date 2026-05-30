/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated defineComponent harness for composable */
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { wireWindowAppNoteboardDirectInput } from '../windowAppNoteboard_manager'

let pinia: ReturnType<typeof createPinia>

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
})

test('wireWindowAppNoteboardDirectInput opens the store when directInput targets the noteboard', async () => {
  const Harness = defineComponent({
    props: {
      directInputProp: {
        default: undefined,
        type: String as () => 'WindowAppNoteboard' | 'AboutFantasiaArchive' | undefined
      }
    },
    setup (props) {
      wireWindowAppNoteboardDirectInput({
        get directInput () {
          return props.directInputProp
        }
      })
      return () => null
    }
  })

  mount(Harness, {
    props: { directInputProp: 'WindowAppNoteboard' },
    global: { plugins: [pinia] }
  })

  expect(S_FaAppNoteboard().isWindowOpen).toBe(true)
})

test('wireWindowAppNoteboardDirectInput ignores unrelated directInput values', async () => {
  const Harness = defineComponent({
    props: {
      directInputProp: {
        default: undefined,
        type: String as () => 'WindowAppNoteboard' | 'AboutFantasiaArchive' | undefined
      }
    },
    setup (props) {
      wireWindowAppNoteboardDirectInput({
        get directInput () {
          return props.directInputProp
        }
      })
      return () => null
    }
  })

  const w = mount(Harness, {
    props: { directInputProp: 'AboutFantasiaArchive' },
    global: { plugins: [pinia] }
  })
  expect(S_FaAppNoteboard().isWindowOpen).toBe(false)

  await w.setProps({ directInputProp: 'WindowAppNoteboard' })
  await nextTick()
  expect(S_FaAppNoteboard().isWindowOpen).toBe(true)
})
