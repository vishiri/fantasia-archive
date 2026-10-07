import { expect, test, vi } from 'vitest'
import { Result, ResultAsync } from 'neverthrow'
import { shallowRef } from 'vue'

import { createWindowStylingMonacoMount } from '../functions/windowStylingMonacoMount'

test('Test that a failed Monaco mount does not clear loading for a newer mount', async () => {
  let rejectFirst: ((error: Error) => void) | undefined
  let releaseSecond: (() => void) | undefined
  let loadCount = 0
  const editor = {
    dispose: vi.fn(),
    getValue: () => 'second',
    layout: vi.fn(),
    onDidChangeModelContent: vi.fn(() => ({ dispose: vi.fn() })),
    setValue: vi.fn()
  }
  const api = createWindowStylingMonacoMount({
    Result,
    ResultAsync,
    loadMonacoModule: () => {
      loadCount += 1
      if (loadCount === 1) {
        return new Promise((_resolve, reject) => {
          rejectFirst = reject
        })
      }
      return new Promise((resolve) => {
        releaseSecond = () => {
          resolve({
            monaco: {
              editor: {
                create: () => editor
              }
            }
          })
        }
      })
    },
    onBeforeUnmount: () => undefined,
    shallowRef
  })
  const handle = api.useMonacoMount({
    onChange: () => undefined
  })
  const host = document.createElement('div')
  const firstMount = handle.mountInto(host, 'first')
  await Promise.resolve()
  const reject = rejectFirst
  if (reject === undefined) {
    throw new Error('missing first Monaco reject')
  }
  reject(new Error('old load failed'))
  await Promise.resolve()
  const secondMount = handle.mountInto(host, 'second')
  expect(handle.isLoading.value).toBe(true)
  await firstMount
  expect(handle.isLoading.value).toBe(true)
  expect(handle.loadError.value).toBeNull()
  const release = releaseSecond
  if (release === undefined) {
    throw new Error('missing second Monaco release')
  }
  release()
  await secondMount
  expect(handle.isLoading.value).toBe(false)
  expect(handle.editor.value).not.toBeNull()
  expect(handle.loadError.value).toBeNull()
})

test('Test that a Monaco editor created for a stale mount is disposed', async () => {
  let createCount = 0
  const editor = {
    dispose: vi.fn(),
    getValue: () => '',
    layout: vi.fn(),
    onDidChangeModelContent: vi.fn(() => ({ dispose: vi.fn() })),
    setValue: vi.fn()
  }
  const api = createWindowStylingMonacoMount({
    Result,
    ResultAsync,
    loadMonacoModule: async () => ({
      monaco: {
        editor: {
          create: () => {
            createCount += 1
            if (createCount === 1) {
              void handle.mountInto(document.createElement('div'), 'newer')
            }
            return editor
          }
        }
      }
    }),
    onBeforeUnmount: () => undefined,
    shallowRef
  })
  const handle = api.useMonacoMount({
    onChange: () => undefined
  })
  await handle.mountInto(document.createElement('div'), 'first')
  expect(editor.dispose).toHaveBeenCalled()
})
