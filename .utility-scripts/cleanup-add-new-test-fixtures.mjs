import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

function walk (dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, out)
    else if (ent.name.endsWith('.ts')) out.push(p)
  }
  return out
}

function stripWrongTitleFields (content) {
  return content
    .replace(/\n[ \t]+titlePluralTranslations: \{\},\n[ \t]+titleSingularTranslations: \{\},\n/g, '\n')
}

function dedupePlacementTitleFields (content) {
  return content.replace(
    /(\n[ \t]+titlePluralTranslations: \{\},\n[ \t]+titleSingularTranslations: \{\},\n[ \t]+id: [^\n]+\n[ \t]+nickname: [^\n]+\n)[ \t]+titlePluralTranslations: \{\},\n[ \t]+titleSingularTranslations: \{\},\n/g,
    '$1'
  )
}

const electronTestDir = path.join(repoRoot, 'src-electron/mainScripts/projectManagement/projectDbContent/_tests')
let changed = 0
for (const file of walk(electronTestDir)) {
  const orig = fs.readFileSync(file, 'utf8')
  const next = stripWrongTitleFields(orig)
  if (next !== orig) {
    fs.writeFileSync(file, next)
    changed += 1
    console.log('electron test cleaned', path.relative(repoRoot, file))
  }
}

const hierarchyTestDir = path.join(repoRoot, 'src/components/projectUI/ProjectHierarchyTree')
for (const file of walk(hierarchyTestDir)) {
  const orig = fs.readFileSync(file, 'utf8')
  const next = dedupePlacementTitleFields(orig)
  if (next !== orig) {
    fs.writeFileSync(file, next)
    changed += 1
    console.log('deduped', path.relative(repoRoot, file))
  }
}

const storeTest = path.join(repoRoot, 'src/stores/_tests/S_FaProjectHierarchyTree.vitest.test.ts')
if (fs.existsSync(storeTest)) {
  const orig = fs.readFileSync(storeTest, 'utf8')
  const next = dedupePlacementTitleFields(orig)
  if (next !== orig) {
    fs.writeFileSync(storeTest, next)
    changed += 1
    console.log('deduped store test')
  }
}

console.log('cleanup files changed', changed)
