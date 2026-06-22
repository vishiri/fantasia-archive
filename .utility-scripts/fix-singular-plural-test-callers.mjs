import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')

function walk (dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (/\.vitest\.test\.ts$/.test(entry.name)) files.push(full)
  }
  return files
}

function fixTests (content) {
  return content
    .replace(
      /updateDocumentTemplateTitleTranslations\(([^,]+),\s*\{\s*'en-US':/g,
      "updateDocumentTemplateTitleTranslations($1, { plural: { 'en-US':"
    )
    .replace(
      /updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations\(([\s\S]*?),\s*\{\s*'en-US':/g,
      (match, prefix) => {
        return `updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations(${prefix}, { plural: { 'en-US':`
      }
    )
    .replace(
      /(\{ plural: \{ 'en-US': [^}]+\})(\s*\))/g,
      '$1, singular: {}$2'
    )
    .replace(
      /resolveDialogProjectSettingsDocumentTemplateResolvedTitle\(\{\s*titlePluralTranslations:/g,
      'resolveDialogProjectSettingsDocumentTemplateResolvedTitle({ titlePluralTranslations:'
    )
    .replace(
      /(\{\s*titlePluralTranslations: [^}]+\})(\s*,\s*'[^']+'\s*\))/g,
      '$1, titleSingularTranslations: {}$2'
    )
    .replace(
      /resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName\(\s*\{\s*'en-US':/g,
      "resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName({ 'en-US':"
    )
}

const files = []
for (const root of ['src', 'src-electron', 'helpers']) {
  walk(path.join(repoRoot, root), files)
}

let count = 0
for (const filePath of files) {
  const before = fs.readFileSync(filePath, 'utf8')
  const after = fixTests(before)
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8')
    count++
  }
}
console.log(`Patched ${count} test files`)
