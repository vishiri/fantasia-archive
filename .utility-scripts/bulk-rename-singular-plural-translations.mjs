import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')

const scanRoots = [
  'src',
  'src-electron',
  'helpers',
  'types'
]

const skipPathParts = [
  `${path.sep}i18n${path.sep}`,
  `${path.sep}.cursor${path.sep}`,
  `${path.sep}node_modules${path.sep}`
]

const extensions = new Set(['.ts', '.vue'])

function walk (dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, files)
      continue
    }
    if (!extensions.has(path.extname(entry.name))) {
      continue
    }
    files.push(full)
  }
  return files
}

function shouldProcess (filePath) {
  const rel = path.relative(repoRoot, filePath)
  if (rel === path.join('types', 'I_dialogProjectSettings.ts')) {
    return true
  }
  if (rel.startsWith(`types${path.sep}`) && rel !== path.join('types', 'I_dialogProjectSettings.ts')) {
    return false
  }
  if (skipPathParts.some((part) => rel.includes(part.replace(/\//g, path.sep)))) {
    return false
  }
  return scanRoots.some((root) => rel.startsWith(`${root}${path.sep}`) || rel === root)
}

function addSingularSiblingAfterPlural (content, pluralKey, singularKey) {
  const pluralProp = `${pluralKey}:`
  const singularProp = `${singularKey}:`
  if (!content.includes(pluralProp)) {
    return content
  }
  const lines = content.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    out.push(line)
    const trimmed = line.trim()
    if (!trimmed.startsWith(pluralProp)) {
      continue
    }
    const nextFew = lines.slice(i + 1, i + 4).join('\n')
    if (nextFew.includes(singularProp)) {
      continue
    }
    const indentMatch = line.match(/^(\s*)/)
    const indent = indentMatch ? indentMatch[1] : ''
    const needsComma = !trimmed.endsWith(',')
    if (trimmed.endsWith('{')) {
      continue
    }
    out.push(`${indent}${singularKey}: {},${needsComma ? '' : ''}`)
  }
  return out.join('\n')
}

function transform (content) {
  let next = content

  next = next.replaceAll('titleTranslationsJson', 'titlePluralTranslationsJson')
  next = next.replaceAll('nicknameTranslationsJson', 'nicknamePluralTranslationsJson')

  next = next.replaceAll('.titleTranslations', '.titlePluralTranslations')
  next = next.replaceAll("['titleTranslations']", "['titlePluralTranslations']")
  next = next.replaceAll("'titleTranslations'", "'titlePluralTranslations'")
  next = next.replaceAll('titleTranslations?:', 'titlePluralTranslations?:')
  next = next.replaceAll('titleTranslations:', 'titlePluralTranslations:')

  next = next.replaceAll('.nicknameTranslations', '.nicknamePluralTranslations')
  next = next.replaceAll("['nicknameTranslations']", "['nicknamePluralTranslations']")
  next = next.replaceAll("'nicknameTranslations'", "'nicknamePluralTranslations'")
  next = next.replaceAll('nicknameTranslations?:', 'nicknamePluralTranslations?:')
  next = next.replaceAll('nicknameTranslations:', 'nicknamePluralTranslations:')

  next = next.replaceAll(
    'hasFaProjectDocumentTemplateTitleTranslation',
    'hasFaProjectDocumentTemplateTitlePluralTranslation'
  )

  next = addSingularSiblingAfterPlural(next, 'titlePluralTranslations', 'titleSingularTranslations')
  next = addSingularSiblingAfterPlural(next, 'nicknamePluralTranslations', 'nicknameSingularTranslations')

  return next
}

const files = []
for (const root of scanRoots) {
  walk(path.join(repoRoot, root), files)
}

const changed = []
for (const filePath of files) {
  if (!shouldProcess(filePath)) {
    continue
  }
  const before = fs.readFileSync(filePath, 'utf8')
  const after = transform(before)
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8')
    changed.push(path.relative(repoRoot, filePath))
  }
}

console.log(`Updated ${changed.length} files`)
for (const file of changed.sort()) {
  console.log(file)
}
