import { expect, test, vi } from 'vitest'

const {
  bootMock,
  createMock,
  axiosInstanceMock
} = vi.hoisted(() => {
  const bootImplementation = vi.fn((callback: unknown) => callback)
  const createdInstance = { id: 'api-instance' }

  return {
    bootMock: bootImplementation,
    createMock: vi.fn(() => createdInstance),
    axiosInstanceMock: createdInstance
  }
})

vi.mock('quasar/wrappers', () => {
  return {
    boot: bootMock
  }
})

vi.mock('axios', () => {
  return {
    default: {
      create: createMock
    }
  }
})

import axiosBootFunction, { api } from '../axios'

/**
 * axios boot file
 * Test if boot stores axios instances in global properties.
 */
test('Test that axios boot assigns $axios and $api to app global properties', () => {
  const appMock = {
    config: {
      globalProperties: {}
    }
  }

  axiosBootFunction({ app: appMock } as never)

  expect(createMock).toHaveBeenCalledOnce()
  expect(api).toBe(axiosInstanceMock)
  expect(appMock.config.globalProperties).toMatchObject({
    $axios: {
      create: createMock
    },
    $api: axiosInstanceMock
  })
})
