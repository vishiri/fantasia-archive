// Optional maintainer aid: surface likely policy drift (not a CI gate).
// Run: yarn audit:policy
// - Non-foundation src/components .vue without matching _tests Vitest or Storybook story
// - Vue <style> blocks that still use rgba( or #hex (consider quasar.variables.scss; see project-scss.mdc)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

/**
 * @param {string} dir
 * @param {(full: string) => boolean} filter
 * @param {string[]} acc
 * @returns {string[]}
 */
function walk (dir, filter, acc = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name)
    if (name.isDirectory()) {
      if (name.name === 'foundation' && full.replace(/\\/g, '/').includes('src/components/')) {
        continue
      }
      walk(full, filter, acc)
    } else if (name.isFile() && filter(full)) {
      acc.push(full)
    }
  }
  return acc
}

const vues = walk(
  path.join(repoRoot, 'src', 'components'),
  (f) => f.endsWith('.vue') && !f.includes(`${path.sep}foundation${path.sep}`)
)
const rel = (f) => path.relative(repoRoot, f).replace(/\\/g, '/')

const missingVitest = []
const missingStory = []
for (const f of vues) {
  const base = path.basename(f, '.vue')
  const dir = path.dirname(f)
  if (!fs.existsSync(path.join(dir, '_tests', `${base}.vitest.test.ts`))) {
    missingVitest.push(rel(f))
  }
  if (!fs.existsSync(path.join(dir, '_tests', `${base}.stories.ts`))) {
    missingStory.push(rel(f))
  }
}

const styleLiteralHits = []
const hexOrRgba = /(rgba?\(|#[0-9a-fA-F]{3,8}\b)/
for (const f of vues) {
  const text = fs.readFileSync(f, 'utf8')
  const i = text.indexOf('<style')
  if (i < 0) {
    continue
  }
  const rest = text.slice(i)
  if (hexOrRgba.test(rest)) {
    const m = rest.match(hexOrRgba)
    styleLiteralHits.push({
      file: rel(f),
      sample: m ? m[1] : 'match'
    })
  }
}

console.log('Policy compliance audit (heuristic, non-blocking)\n')

console.log('--- Vue SFCs (non-foundation) missing _tests/<Name>.vitest.test.ts ---')
if (missingVitest.length === 0) {
  console.log('(none)')
} else {
  missingVitest.sort().forEach((l) => console.log(l))
}

console.log('\n--- Vue SFCs (non-foundation) missing _tests/<Name>.stories.ts ---')
if (missingStory.length === 0) {
  console.log('(none)')
} else {
  missingStory.sort().forEach((l) => console.log(l))
}

console.log('\n--- <style> blocks with rgba( or #hex (review vs quasar.variables.scss) ---')
if (styleLiteralHits.length === 0) {
  console.log('(none)')
} else {
  for (const { file, sample } of styleLiteralHits.sort((a, b) => a.file.localeCompare(b.file))) {
    console.log(`${file}  [${sample}]`)
  }
}
