import { expect, test, vi } from 'vitest'

const bootMock = vi.hoisted(() => {
  return vi.fn((callback: unknown) => callback)
})

const vuePluginInstallMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('#q-app/wrappers', () => {
  return {
    defineBoot: bootMock
  }
})

vi.mock('@quasar/quasar-ui-qmarkdown', () => {
  return {
    default: {
      install: vuePluginInstallMock
    }
  }
})

vi.mock('@quasar/quasar-ui-qmarkdown/dist/index.css', () => ({}))

import qmarkdownBoot from '../qmarkdown'

/**
 * qmarkdown boot file
 * Registers the Quasar QMarkdown Vue plugin on the app instance.
 */
test('Test that qmarkdown boot installs the QMarkdown plugin on the app', () => {
  const appUseMock = vi.fn()

  qmarkdownBoot({
    app: {
      use: appUseMock
    }
  } as never)

  expect(appUseMock).toHaveBeenCalledOnce()
  expect(appUseMock.mock.calls[0][0]).toMatchObject({
    install: vuePluginInstallMock
  })
})
