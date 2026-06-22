/* eslint-disable @stylistic/operator-linebreak */
import fs from 'node:fs'
import path from 'node:path'

const locales = ['ar', 'de', 'el', 'es', 'fi', 'fr', 'hi', 'it', 'ja', 'nb', 'pt', 'ru', 'sv', 'uk', 'zh', 'en-US']

for (const locale of locales) {
  const psPath = path.join('i18n', locale, 'dialogs', 'L_projectSettings.ts')
  const text = fs.readFileSync(psPath, 'utf8')
  const tooltipMatch = text.match(/documentTemplateTitleTranslations:\s*\{\s*tooltip:\s*'([^']*)'/)
  const fallbackMatch = text.match(/fallbackWarningTooltip:\s*'((?:\\'|[^'])*)'/s)
    ?? text.match(/fallbackWarningTooltip:\s*\n\s*"((?:\\"|[^"])*)"/s)
  const tooltip = tooltipMatch ? tooltipMatch[1] : 'Edit translations'
  const fallback = fallbackMatch
    ? fallbackMatch[1].replace(/\\n/g, '\n')
    : "This field lacks current language's translation.\nFallback used: {fallbackLanguageName}"
  const dir = path.join('i18n', locale, 'components', 'elements', 'FaLocaleTranslationsInput')
  fs.mkdirSync(dir, { recursive: true })
  const out = `export default {
  translateButtonTooltip: ${JSON.stringify(tooltip)},
  fallbackWarningTooltip: ${JSON.stringify(fallback)}
}
`
  fs.writeFileSync(path.join(dir, 'L_FaLocaleTranslationsInput.ts'), out)
}

console.log('Generated FaLocaleTranslationsInput i18n for', locales.length, 'locales')
