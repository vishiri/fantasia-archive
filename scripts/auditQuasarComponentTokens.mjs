/**
 * Fails (exit 1) when a `$q…` SCSS name is *used* in a consumer file but not *defined* in
 * `src/css/theme/quasar-components/_*.variables.scss`. Catches partial truncations of Quasar
 * component token files (same class of bug as missing `$qCheckbox-bg-transition` or
 * `$qTooltip-fontSize`).
 *
 * Run: node scripts/auditQuasarComponentTokens.mjs
 * Or:  yarn audit:quasar-component-tokens
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const THEME_DIR = join(ROOT, 'src', 'css', 'theme', 'quasar-components')
/* Quasar component tokens use $qPascalCase-segments (not $query / $quote). */
const DEF_NAME_RE = /^\s*(\$q[A-Z][a-zA-Z0-9-]*)\s*:/gmu
const REF_RE = /\$q[A-Z][a-zA-Z0-9-]*/gu

const SKIP_DIR = new Set([
  'node_modules',
  '.git',
  '.quasar',
  'dist',
  'storybook-static',
  'coverage',
  'test-results',
  'release',
  'e2e-tests',
  'helpers',
  'vitest',
  'types',
  'i18n',
  'scripts',
  'public'
])

const SCAN_EXT = new Set(['.vue', '.scss', '.sass', '.css'])

function * walkFiles (dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const ent of entries) {
    const full = join(dir, ent.name)
    if (ent.isDirectory()) {
      if (SKIP_DIR.has(ent.name)) {
        continue
      }
      yield * walkFiles(full)
    } else if (ent.isFile()) {
      const ext = ent.name.slice(ent.name.lastIndexOf('.')).toLowerCase()
      if (SCAN_EXT.has(ext)) {
        yield full
      }
    }
  }
}

function loadDefinitions () {
  const defined = new Set()
  for (const name of readdirSync(THEME_DIR)) {
    if (!name.startsWith('_') || !name.endsWith('.variables.scss')) {
      continue
    }
    const text = readFileSync(join(THEME_DIR, name), 'utf8')
    for (const m of text.matchAll(DEF_NAME_RE)) {
      defined.add(m[1].slice(1))
    }
  }
  if (defined.size === 0) {
    throw new Error(`No $q* definitions found under ${relative(ROOT, THEME_DIR)}/`)
  }
  return defined
}

function isConsumerFile (absPath) {
  const rel = relative(ROOT, absPath).replaceAll('\\', '/')
  if (rel.startsWith('src/css/theme/quasar-components/')) {
    return false
  }
  if (!rel.startsWith('src/') && !rel.startsWith('.storybook-workspace/')) {
    return false
  }
  if (rel.includes('/_tests/') && (rel.endsWith('.vitest.test.ts') || rel.endsWith('.stories.ts'))) {
    return false
  }
  return true
}

function collectRefs (text) {
  const out = new Set()
  for (const m of text.matchAll(REF_RE)) {
    out.add(m[0].slice(1))
  }
  return out
}

function main () {
  const defined = loadDefinitions()
  const referenced = new Set()
  for (const abs of walkFiles(join(ROOT, 'src'))) {
    if (!isConsumerFile(abs)) {
      continue
    }
    if (!statSync(abs).isFile()) {
      continue
    }
    const text = readFileSync(abs, 'utf8')
    for (const name of collectRefs(text)) {
      referenced.add(name)
    }
  }
  for (const abs of walkFiles(join(ROOT, '.storybook-workspace'))) {
    if (!isConsumerFile(abs)) {
      continue
    }
    const text = readFileSync(abs, 'utf8')
    for (const name of collectRefs(text)) {
      referenced.add(name)
    }
  }
  const missing = [...referenced]
    .filter((n) => !defined.has(n))
    .toSorted((a, b) => a.localeCompare(b))
  if (missing.length > 0) {
    console.error('auditQuasarComponentTokens: $q* references with no definition in src/css/theme/quasar-components/:\n')
    for (const m of missing) {
      console.error(`  - $${m}`)
    }
    process.exit(1)
  }
  console.log(
    JSON.stringify(
      {
        definedQuasarComponentTokenCount: defined.size,
        distinctReferencedQTokenCount: referenced.size,
        themeDir: relative(ROOT, THEME_DIR).replaceAll('\\', '/')
      },
      null,
      2
    )
  )
}

main()
