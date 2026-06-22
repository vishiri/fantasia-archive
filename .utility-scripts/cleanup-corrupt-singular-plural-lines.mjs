import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')

function walk (dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (/\.(ts|vue)$/.test(entry.name)) files.push(full)
  }
  return files
}

function cleanupCorruptSingularLines (content) {
  const lines = content.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    const isCorruptSingularLine =
      trimmed === 'titleSingularTranslations: {},' ||
      trimmed === 'nicknameSingularTranslations: {},'
    if (isCorruptSingularLine && i > 0) {
      const prev = lines[i - 1].trim()
      const prevIsObjectLiteralProp =
        prev.endsWith(',') ||
        prev.endsWith('{') ||
        prev.startsWith('titlePluralTranslations:') ||
        prev.startsWith('nicknamePluralTranslations:') ||
        prev.startsWith('titleSingularTranslations:') ||
        prev.startsWith('nicknameSingularTranslations:')
      if (!prevIsObjectLiteralProp) {
        continue
      }
    }
    out.push(line)
  }
  return out.join('\n')
}

function fixBrokenReferences (content) {
  return content
    .replaceAll('titleTranslations', 'titlePluralTranslations')
    .replaceAll('nicknameTranslations', 'nicknamePluralTranslations')
}

const roots = ['src', 'src-electron', 'helpers', 'types']
const files = []
for (const root of roots) walk(path.join(repoRoot, root), files)

let count = 0
for (const filePath of files) {
  if (filePath.includes(`${path.sep}i18n${path.sep}`)) continue
  const before = fs.readFileSync(filePath, 'utf8')
  let after = cleanupCorruptSingularLines(before)
  after = fixBrokenReferences(after)
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8')
    count++
  }
}
console.log(`Cleaned ${count} files`)
