import { BrowserWindow, MenuItem, Menu } from 'electron'

export const setupSpellChecker = (appWindow: BrowserWindow | undefined) => {
  if (!appWindow) return

  appWindow.webContents.on('context-menu', (_, params) => {
    const menu = new Menu()
    const webContents = appWindow.webContents

    // Add each spelling suggestion
    for (const suggestion of params.dictionarySuggestions) {
      menu.append(new MenuItem({
        label: suggestion,
        click: () => webContents.replaceMisspelling(suggestion)
      }))
    }

    // Allow users to add the misspelled word to the dictionary
    if (params.misspelledWord) {
      menu.append(
        new MenuItem({
          label: 'Add to dictionary',
          click: () => webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
        })
      )
    }
    if ((params.dictionarySuggestions && params.dictionarySuggestions.length) || params.misspelledWord) {
      menu.popup()
    }
  })
}
