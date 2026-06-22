import fs from 'node:fs'
import path from 'node:path'

const locales = ['ar', 'de', 'el', 'es', 'fi', 'fr', 'hi', 'it', 'ja', 'nb', 'pt', 'ru', 'sv', 'uk', 'zh', 'en-US']

for (const locale of locales) {
  const indexPath = path.join('i18n', locale, 'index.ts')
  let indexText = fs.readFileSync(indexPath, 'utf8')

  if (!indexText.includes('L_FaLocaleTranslationsInput')) {
    indexText = indexText.replace(
      "import L_FaIconPickerInput from './components/elements/FaIconPickerInput/L_FaIconPickerInput'",
      "import L_FaIconPickerInput from './components/elements/FaIconPickerInput/L_FaIconPickerInput'\nimport L_FaLocaleTranslationsInput from './components/elements/FaLocaleTranslationsInput/L_FaLocaleTranslationsInput'"
    )
    indexText = indexText.replace(
      '  faIconPickerInput: L_FaIconPickerInput,',
      '  faIconPickerInput: L_FaIconPickerInput,\n\n  // COMPONENT - FA LOCALE TRANSLATIONS INPUT\n  faLocaleTranslationsInput: L_FaLocaleTranslationsInput,'
    )
    fs.writeFileSync(indexPath, indexText)
  }

  const psPath = path.join('i18n', locale, 'dialogs', 'L_projectSettings.ts')
  let psText = fs.readFileSync(psPath, 'utf8')
  psText = psText.replace(/\n\s*fallbackWarningTooltip:[\s\S]*?\n\s*\},/m, '\n    },')
  psText = psText.replace(/\n\s*documentTemplateTitleTranslations:\s*\{\s*tooltip:[\s\S]*?\n\s*\},/m, '')
  fs.writeFileSync(psPath, psText)
}

console.log('Updated locale index.ts and cleaned projectSettings for', locales.length, 'locales')
