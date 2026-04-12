import type { BrowserWindow } from 'electron'
import { MenuItem, Menu } from 'electron'
import L_spellChecker_de from 'app/i18n/de/globalFunctionality/L_spellChecker'
import L_spellChecker_enUS from 'app/i18n/en-US/globalFunctionality/L_spellChecker'
import L_spellChecker_fr from 'app/i18n/fr/globalFunctionality/L_spellChecker'
import { getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettingsStore'

const resolveAddToDictionaryLabel = () => {
  const code = getFaUserSettings().store.languageCode
  if (code === 'de') {
    return L_spellChecker_de.addToDictionary
  }
  if (code === 'fr') {
    return L_spellChecker_fr.addToDictionary
  }
  return L_spellChecker_enUS.addToDictionary
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
