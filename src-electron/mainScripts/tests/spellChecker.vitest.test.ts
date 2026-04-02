import { test, expect, vi, beforeEach } from 'vitest'
import { setupSpellChecker } from '../spellChecker'
import { BrowserWindow } from 'electron'

const { MenuMock, MenuItemMock, menuInstances } = vi.hoisted(() => {
  const instances: Array<{ append: ReturnType<typeof vi.fn>, popup: ReturnType<typeof vi.fn> }> = []
  return {
    menuInstances: instances,
    MenuMock: vi.fn(function () {
      const instance = {
        append: vi.fn(),
        popup: vi.fn()
      }
      instances.push(instance)
      return instance
    }),
    MenuItemMock: vi.fn(function (item) {
      return item
    })
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

  setupSpellChecker(appWindow as unknown as BrowserWindow)
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

/**
 * setupSpellChecker
 * Undefined window returns immediately (no listener registration).
 */
test('Test that setupSpellChecker with undefined appWindow returns without throwing', () => {
  expect(() => setupSpellChecker(undefined)).not.toThrow()
})

/**
 * setupSpellChecker
 * Suggestions only still opens the context menu popup.
 */
test('Test that spellChecker shows popup with suggestions only', () => {
  const onMock = vi.fn()
  const appWindow = {
    webContents: {
      on: onMock,
      replaceMisspelling: vi.fn(),
      session: {
        addWordToSpellCheckerDictionary: vi.fn()
      }
    }
  }
  setupSpellChecker(appWindow as unknown as BrowserWindow)
  const contextMenuHandler = onMock.mock.calls[0][1]
  menuInstances.length = 0
  contextMenuHandler({}, { dictionarySuggestions: ['fix'], misspelledWord: '' })

  const activeMenu = menuInstances[0]
  expect(activeMenu.popup).toHaveBeenCalledOnce()
  expect(MenuItemMock.mock.calls.length).toBe(1)
})

/**
 * setupSpellChecker
 * Misspelled word only adds dictionary entry and still pops up.
 */
test('Test that spellChecker shows popup with misspelled word only', () => {
  const onMock = vi.fn()
  const appWindow = {
    webContents: {
      on: onMock,
      replaceMisspelling: vi.fn(),
      session: {
        addWordToSpellCheckerDictionary: vi.fn()
      }
    }
  }
  setupSpellChecker(appWindow as unknown as BrowserWindow)
  const contextMenuHandler = onMock.mock.calls[0][1]
  menuInstances.length = 0
  contextMenuHandler({}, { dictionarySuggestions: [], misspelledWord: 'typo' })

  const activeMenu = menuInstances[0]
  expect(activeMenu.popup).toHaveBeenCalledOnce()
  expect(MenuItemMock.mock.calls.length).toBe(1)
})

/**
 * setupSpellChecker
 * No suggestions and no misspelled word does not call popup.
 */
test('Test that spellChecker does not popup when there is nothing to show', () => {
  const onMock = vi.fn()
  const appWindow = {
    webContents: {
      on: onMock,
      replaceMisspelling: vi.fn(),
      session: {
        addWordToSpellCheckerDictionary: vi.fn()
      }
    }
  }
  setupSpellChecker(appWindow as unknown as BrowserWindow)
  const contextMenuHandler = onMock.mock.calls[0][1]
  menuInstances.length = 0
  contextMenuHandler({}, { dictionarySuggestions: [], misspelledWord: '' })

  const activeMenu = menuInstances[0]
  expect(activeMenu.popup).not.toHaveBeenCalled()
})
