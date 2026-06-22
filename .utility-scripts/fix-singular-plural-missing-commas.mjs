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

function fixMissingCommasBeforeSingular (content) {
  const singularLine = /^\s+(titleSingularTranslations|nicknameSingularTranslations):/
  const lines = content.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (singularLine.test(line) && i > 0) {
      const prevIndex = out.length - 1
      const prev = out[prevIndex]
      if (prev !== undefined) {
        const prevTrimmed = prev.trimEnd()
        if (
          prevTrimmed.length > 0 &&
          !prevTrimmed.endsWith(',') &&
          !prevTrimmed.endsWith('{') &&
          !prevTrimmed.endsWith('(') &&
          !prevTrimmed.endsWith('[')
        ) {
          out[prevIndex] = `${prevTrimmed},`
        }
      }
    }
    out.push(line)
  }
  return out.join('\n')
}

const roots = ['src', 'src-electron', 'helpers', 'types']
const files = []
for (const root of roots) walk(path.join(repoRoot, root), files)

let count = 0
for (const filePath of files) {
  if (filePath.includes(`${path.sep}i18n${path.sep}`)) continue
  const before = fs.readFileSync(filePath, 'utf8')
  const after = fixMissingCommasBeforeSingular(before)
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8')
    count++
  }
}
console.log(`Fixed commas in ${count} files`)
