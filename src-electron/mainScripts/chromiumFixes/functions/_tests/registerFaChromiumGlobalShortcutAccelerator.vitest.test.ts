import { expect, test, vi } from 'vitest'

import { registerFaChromiumGlobalShortcutAccelerator } from '../registerFaChromiumGlobalShortcutAccelerator'

/**
 * registerFaChromiumGlobalShortcutAccelerator
 * Returns the accelerator string when the primary accelerator registers on the first try.
 */
test('Test that registerFaChromiumGlobalShortcutAccelerator returns the accelerator when it registers directly', () => {
  const onPressed = vi.fn()
  const register = vi.fn(() => true)
  const registered = registerFaChromiumGlobalShortcutAccelerator(
    {
      isRegistered: () => false,
      register,
      unregister: vi.fn()
    },
    'CommandOrControl+Shift+O',
    onPressed
  )

  expect(registered).toBe('CommandOrControl+Shift+O')
  expect(register).toHaveBeenCalledOnce()
  expect(register).toHaveBeenCalledWith('CommandOrControl+Shift+O', onPressed)
})

/**
 * registerFaChromiumGlobalShortcutAccelerator
 * Unregisters a pre-existing accelerator before re-registering it.
 */
test('Test that registerFaChromiumGlobalShortcutAccelerator unregisters an already-registered accelerator first', () => {
  const unregister = vi.fn()
  const register = vi.fn(() => true)
  const registered = registerFaChromiumGlobalShortcutAccelerator(
    {
      isRegistered: (accelerator: string) => accelerator === 'CommandOrControl+Shift+O',
      register,
      unregister
    },
    'CommandOrControl+Shift+O',
    vi.fn()
  )

  expect(unregister).toHaveBeenCalledWith('CommandOrControl+Shift+O')
  expect(registered).toBe('CommandOrControl+Shift+O')
})

/**
 * registerFaChromiumGlobalShortcutAccelerator
 * Returns null for non-CommandOrControl accelerators that fail to register (no Control+ fallback).
 */
test('Test that registerFaChromiumGlobalShortcutAccelerator returns null for non-CommandOrControl accelerators', () => {
  const register = vi.fn(() => false)
  const onPressed = vi.fn()
  const registered = registerFaChromiumGlobalShortcutAccelerator(
    {
      isRegistered: () => false,
      register,
      unregister: vi.fn()
    },
    'Alt+Shift+O',
    onPressed
  )

  expect(registered).toBe(null)
  expect(register).toHaveBeenCalledOnce()
  expect(onPressed).not.toHaveBeenCalled()
})

/**
 * registerFaChromiumGlobalShortcutAccelerator
 * Retries with literal Control+ when CommandOrControl+ fails, returning the fallback accelerator.
 */
test('Test that registerFaChromiumGlobalShortcutAccelerator retries with Control+ when CommandOrControl+ fails', () => {
  const onPressed = vi.fn()
  const register = vi.fn((accelerator: string) => accelerator === 'Control+Shift+O')
  const registered = registerFaChromiumGlobalShortcutAccelerator(
    {
      isRegistered: (accelerator: string) => accelerator === 'Control+Shift+O',
      register,
      unregister: vi.fn()
    },
    'CommandOrControl+Shift+O',
    onPressed
  )

  expect(registered).toBe('Control+Shift+O')
  expect(register).toHaveBeenCalledWith('CommandOrControl+Shift+O', onPressed)
  expect(register).toHaveBeenCalledWith('Control+Shift+O', onPressed)
})

/**
 * registerFaChromiumGlobalShortcutAccelerator
 * Returns null when both CommandOrControl+ and the Control+ fallback fail to register.
 */
test('Test that registerFaChromiumGlobalShortcutAccelerator returns null when both variants fail', () => {
  const register = vi.fn(() => false)
  const registered = registerFaChromiumGlobalShortcutAccelerator(
    {
      isRegistered: () => false,
      register,
      unregister: vi.fn()
    },
    'CommandOrControl+Shift+O',
    vi.fn()
  )

  expect(registered).toBe(null)
  expect(register).toHaveBeenCalledWith('CommandOrControl+Shift+O', expect.any(Function))
  expect(register).toHaveBeenCalledWith('Control+Shift+O', expect.any(Function))
})
