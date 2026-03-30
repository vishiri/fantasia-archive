import { test, expect, vi, beforeEach } from 'vitest'
import { setupSpellChecker } from '../spellChecker'

const { MenuMock, MenuItemMock, menuInstances } = vi.hoisted(() => {
  const instances: Array<{ append: ReturnType<typeof vi.fn>, popup: ReturnType<typeof vi.fn> }> = []
  return {
    menuInstances: instances,
    MenuMock: vi.fn(() => {
      const instance = {
        append: vi.fn(),
        popup: vi.fn()
      }
      instances.push(instance)
      return instance
    }),
    MenuItemMock: vi.fn((item) => item)
  }
})

vi.mock('electron', () => {
  return {
    Menu: MenuMock,
    MenuItem: MenuItemMock
  }
})

beforeEach(() => {
  MenuMock.mockClear()
  MenuItemMock.mockClear()
  menuInstances.length = 0
})

/**
 * setupSpellChecker
 * Test context-menu menu item wiring.
 */
test('Test that spellChecker works correctly', () => {
  const onMock = vi.fn()
  const replaceMisspelling = vi.fn()
  const addWordToSpellCheckerDictionary = vi.fn()

  const appWindow = {
    webContents: {
      on: onMock,
      replaceMisspelling,
      session: {
        addWordToSpellCheckerDictionary
      }
    }
  }

  setupSpellChecker(appWindow as any)
  expect(onMock).toHaveBeenCalledOnce()

  const contextMenuHandler = onMock.mock.calls[0][1]
  contextMenuHandler({}, { dictionarySuggestions: ['hello', 'world'], misspelledWord: 'helo' })

  const activeMenu = menuInstances[0]
  expect(MenuItemMock).toHaveBeenCalledTimes(3)
  expect(activeMenu.append).toHaveBeenCalledTimes(3)
  expect(activeMenu.popup).toHaveBeenCalledOnce()

  const replaceWordItem = MenuItemMock.mock.calls[0][0]
  replaceWordItem.click()
  expect(replaceMisspelling).toHaveBeenCalledWith('hello')

  const addWordItem = MenuItemMock.mock.calls[2][0]
  addWordItem.click()
  expect(addWordToSpellCheckerDictionary).toHaveBeenCalledWith('helo')
})
