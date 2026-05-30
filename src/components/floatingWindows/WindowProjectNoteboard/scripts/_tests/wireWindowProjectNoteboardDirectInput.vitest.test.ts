/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated defineComponent harness for composable */
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { wireWindowProjectNoteboardDirectInput } from '../windowProjectNoteboard_manager'

let pinia: ReturnType<typeof createPinia>

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
})

test('wireWindowProjectNoteboardDirectInput opens the store when directInput targets the noteboard', async () => {
  const Harness = defineComponent({
    props: {
      directInputProp: {
        default: undefined,
        type: String as () => 'WindowProjectNoteboard' | 'AboutFantasiaArchive' | undefined
      }
    },
    setup (props) {
      wireWindowProjectNoteboardDirectInput({
        get directInput () {
          return props.directInputProp
        }
      })
      return () => null
    }
  })

  mount(Harness, {
    props: { directInputProp: 'WindowProjectNoteboard' },
    global: { plugins: [pinia] }
  })

  expect(S_FaProjectNoteboard().isWindowOpen).toBe(true)
})

test('wireWindowProjectNoteboardDirectInput ignores unrelated directInput values', async () => {
  const Harness = defineComponent({
    props: {
      directInputProp: {
        default: undefined,
        type: String as () => 'WindowProjectNoteboard' | 'AboutFantasiaArchive' | undefined
      }
    },
    setup (props) {
      wireWindowProjectNoteboardDirectInput({
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
  expect(S_FaProjectNoteboard().isWindowOpen).toBe(false)

  await w.setProps({ directInputProp: 'WindowProjectNoteboard' })
  await nextTick()
  expect(S_FaProjectNoteboard().isWindowOpen).toBe(true)
})
