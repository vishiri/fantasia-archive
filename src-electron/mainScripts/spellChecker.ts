import type { BrowserWindow } from 'electron'
import { MenuItem, Menu, app } from 'electron'
import T_spellChecker_enUS from 'app/src/i18n/en-US/globalFunctionality/T_spellChecker'
import T_spellChecker_fr from 'app/src/i18n/fr/globalFunctionality/T_spellChecker'

const resolveAddToDictionaryLabel = () => {
  const appLocale = app.getLocale().toLowerCase()
  if (appLocale.startsWith('fr')) return T_spellChecker_fr.addToDictionary
  return T_spellChecker_enUS.addToDictionary
}

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
          label: resolveAddToDictionaryLabel(),
          click: () => webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
        })
      )
    }
    if ((params.dictionarySuggestions && params.dictionarySuggestions.length) || params.misspelledWord) {
      menu.popup()
    }
  })
}
