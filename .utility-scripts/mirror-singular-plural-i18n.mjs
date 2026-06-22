import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')
const locales = ['ar', 'de', 'el', 'es', 'fi', 'fr', 'hi', 'it', 'ja', 'nb', 'pt', 'ru', 'sv', 'uk', 'zh']

// After structural mirror, run apply-singular-plural-locale-translations.mjs for localized strings.
const singularPluralBlock = `  singularPluralMissing: {
    bothIntro: 'Missing translations for current language:',
    singularBullet: 'Singular form missing',
    pluralBullet: 'Plural form missing',
    usingFallback: 'Using fallback of {fallbackLanguageName}'
  },
`

for (const loc of locales) {
  const inputPath = path.join(repoRoot, 'i18n', loc, 'components', 'elements', 'FaLocaleTranslationsInput', 'L_FaLocaleTranslationsInput.ts')
  let inputText = fs.readFileSync(inputPath, 'utf8')
  if (!inputText.includes('singularColumnLabel')) {
    inputText = inputText.replace(/\n}\s*$/, ",\n  singularColumnLabel: 'Singular',\n  pluralColumnLabel: 'Plural'\n}\n")
    fs.writeFileSync(inputPath, inputText)
  }

  const settingsPath = path.join(repoRoot, 'i18n', loc, 'dialogs', 'L_projectSettings.ts')
  let settingsText = fs.readFileSync(settingsPath, 'utf8')
  if (!settingsText.includes('singularPluralMissing')) {
    settingsText = settingsText.replace(
      /(\s+bulletWorldTemplateDuplicateDocumentTemplate:[^\n]+\n\s+},)\n(\s+categories:)/,
      `$1\n${singularPluralBlock}$2`
    )
    fs.writeFileSync(settingsPath, settingsText)
  }
}

import { spawnSync } from 'node:child_process'
const apply = spawnSync(process.execPath, [path.join(repoRoot, '.utility-scripts', 'apply-singular-plural-locale-translations.mjs')], {
  cwd: repoRoot,
  stdio: 'inherit'
})
if (apply.status !== 0) {
  process.exit(apply.status ?? 1)
}

console.log('mirrored singular/plural i18n keys')
