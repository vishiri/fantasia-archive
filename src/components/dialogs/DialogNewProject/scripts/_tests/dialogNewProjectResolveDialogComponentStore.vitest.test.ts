import { beforeEach, expect, test, vi } from 'vitest'

vi.mock('app/src/stores/S_Dialog', () => {
  return {
    S_DialogComponent: vi.fn()
  }
})

import * as DialogStoreModule from 'app/src/stores/S_Dialog'

import { resolveDialogComponentStoreOrNull } from '../dialogNewProjectResolveDialogComponentStore'

type T_AccessorFn = typeof DialogStoreModule.S_DialogComponent

type T_ResolvedDialogStub = ReturnType<T_AccessorFn>

beforeEach(() => {
  const happyPath = (): T_ResolvedDialogStub =>
    ({}) as unknown as T_ResolvedDialogStub
  vi.mocked(DialogStoreModule.S_DialogComponent).mockImplementation(
    happyPath as unknown as T_AccessorFn
  )
})

test('Test resolveDialogComponentStoreOrNull unwraps Pinia dialog store normally', () => {
  expect(resolveDialogComponentStoreOrNull()).toEqual({})
})

test('Test resolveDialogComponentStoreOrNull returns null when accessor throws', () => {
  const throwingAccessor = (): T_ResolvedDialogStub => {
    throw new Error('pinia inaccessible')
  }
  vi.mocked(DialogStoreModule.S_DialogComponent).mockImplementation(
    throwingAccessor as unknown as T_AccessorFn
  )
  expect(resolveDialogComponentStoreOrNull()).toBeNull()
})
