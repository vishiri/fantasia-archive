import { expect, test, vi } from 'vitest'

import { registerFaChromiumGlobalShortcutAccelerator } from '../registerFaChromiumGlobalShortcutAccelerator'

test('registerFaChromiumGlobalShortcutAccelerator returns false for non-CommandOrControl accelerators', () => {
  const register = vi.fn(() => false)
  const onPressed = vi.fn()
  const didRegister = registerFaChromiumGlobalShortcutAccelerator(
    {
      isRegistered: () => false,
      register,
      unregister: vi.fn()
    },
    'Alt+Shift+O',
    onPressed
  )

  expect(didRegister).toBe(false)
  expect(register).toHaveBeenCalledOnce()
  expect(onPressed).not.toHaveBeenCalled()
})

test('registerFaChromiumGlobalShortcutAccelerator retries with Control+ when CommandOrControl+ fails', () => {
  const onPressed = vi.fn()
  const register = vi.fn((accelerator: string) => accelerator === 'Control+Shift+O')
  const didRegister = registerFaChromiumGlobalShortcutAccelerator(
    {
      isRegistered: (accelerator: string) => accelerator === 'Control+Shift+O',
      register,
      unregister: vi.fn()
    },
    'CommandOrControl+Shift+O',
    onPressed
  )

  expect(didRegister).toBe(true)
  expect(register).toHaveBeenCalledWith('CommandOrControl+Shift+O', onPressed)
  expect(register).toHaveBeenCalledWith('Control+Shift+O', onPressed)
})
