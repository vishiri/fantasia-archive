// Domain policy grep suite for full project audit.
// Run: node .utility-scripts/domainPolicyGrep.mjs
// Exit 1 when any high-signal policy hit found (non-test production paths).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

/** @typedef {{ id: string, severity: 'critical' | 'high' | 'medium' | 'low', file: string, line?: number, sample: string }} Hit */

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.quasar',
  'coverage',
  'test-results',
  'storybook-static',
  '.git'
])

const TEST_PATH_RE = /(_tests\/|\.vitest\.test\.|\.playwright\.|\.stories\.|playwright\.spec\.)/

/**
 * @param {string} dir
 * @param {string[]} acc
 * @returns {string[]}
 */
function walk (dir, acc = []) {
  if (!fs.existsSync(dir)) {
    return acc
  }
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) {
      continue
    }
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      walk(full, acc)
    } else if (/\.(ts|vue|mjs)$/.test(ent.name)) {
      acc.push(full)
    }
  }
  return acc
}

/**
 * @param {string} filePath
 * @returns {boolean}
 */
function isProductionSource (filePath) {
  const rel = path.relative(repoRoot, filePath).replace(/\\/g, '/')
  if (TEST_PATH_RE.test(rel)) {
    return false
  }
  if (rel.startsWith('i18n/') && rel.endsWith('.ts')) {
    return false
  }
  return true
}

/**
 * @param {string[]} roots
 * @returns {string[]}
 */
function collectFiles (roots) {
  const acc = []
  for (const root of roots) {
    walk(path.join(repoRoot, root), acc)
  }
  return acc.filter(isProductionSource)
}

/**
 * @param {string} filePath
 * @param {RegExp} re
 * @param {string} id
 * @param {'critical' | 'high' | 'medium' | 'low'} severity
 * @returns {Hit[]}
 */
function grepFile (filePath, re, id, severity) {
  const text = fs.readFileSync(filePath, 'utf8')
  const rel = path.relative(repoRoot, filePath).replace(/\\/g, '/')
  const hits = []
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (re.test(line)) {
      hits.push({
        id,
        severity,
        file: rel,
        line: i + 1,
        sample: line.trim().slice(0, 120)
      })
    }
    re.lastIndex = 0
  }
  return hits
}

/** @type {Hit[]} */
const allHits = []

const files = collectFiles(['src', 'src-electron', 'helpers', 'types'])

for (const file of files) {
  const rel = path.relative(repoRoot, file).replace(/\\/g, '/')

  if (/\bQTree\b/.test(fs.readFileSync(file, 'utf8'))) {
    allHits.push(...grepFile(file, /\bQTree\b/, 'fa-he-tree-forbidden-qtree', 'high'))
  }

  if (rel.startsWith('src-electron/contentBridgeAPIs/')) {
    allHits.push(...grepFile(file, /from ['"]neverthrow['"]/, 'preload-neverthrow', 'high'))
  }

  if (rel.endsWith('_manager.ts')) {
    allHits.push(...grepFile(file, /^export function /m, 'manager-export-function', 'medium'))
    allHits.push(...grepFile(file, /^export const \w+ = (\(|async \()/m, 'manager-top-level-arrow', 'medium'))
  }

  if (/ipcRenderer\.invoke\(['"][^'"]+['"]/.test(fs.readFileSync(file, 'utf8'))) {
    allHits.push(...grepFile(file, /ipcRenderer\.invoke\(['"][^'"]+['"]/, 'raw-ipc-literal', 'high'))
  }

  if (rel.includes('src-electron/')) {
    const codeOnly = fs.readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    if (/nodeIntegration:\s*true/.test(codeOnly)) {
      allHits.push(...grepFile(file, /nodeIntegration:\s*true/, 'electron-node-integration-true', 'critical'))
    }
  }
}

// changeLog brace literals (vue-i18n compile risk)
for (const localeDir of fs.readdirSync(path.join(repoRoot, 'i18n'))) {
  const changeLog = path.join(repoRoot, 'i18n', localeDir, 'documents', 'changeLog.md')
  if (!fs.existsSync(changeLog)) {
    continue
  }
  const text = fs.readFileSync(changeLog, 'utf8')
  const braceRe = /\{[^{}]+\}/g
  let m
  while ((m = braceRe.exec(text)) !== null) {
    if (m[0].includes('**') || m[0].length < 3) {
      continue
    }
    const lineNum = text.slice(0, m.index).split('\n').length
    allHits.push({
      id: 'changelog-brace-literal',
      severity: 'medium',
      file: path.relative(repoRoot, changeLog).replace(/\\/g, '/'),
      line: lineNum,
      sample: m[0]
    })
  }
}

// Re-export-only shims
for (const file of walk(path.join(repoRoot, 'src'))) {
  if (!file.endsWith('.ts')) {
    continue
  }
  const rel = path.relative(repoRoot, file).replace(/\\/g, '/')
  if (rel.endsWith('_manager.ts')) {
    continue
  }
  const text = fs.readFileSync(file, 'utf8').trim()
  if (/^export \{[^}]+\} from ['"]/.test(text) && !text.includes('export type') && text.split('\n').length <= 3) {
    allHits.push({
      id: 're-export-shim',
      severity: 'low',
      file: path.relative(repoRoot, file).replace(/\\/g, '/'),
      sample: text.split('\n')[0]
    })
  }
}

const outPath = path.join(repoRoot, 'test-results', 'phase3-domainPolicyGrep.json')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify({
  hitCount: allHits.length,
  hits: allHits
}, null, 2))

console.log(`Domain policy grep: ${allHits.length} hit(s)`)
const bySeverity = {
  critical: 0,
  high: 0,
  medium: 0,
  low: 0
}
for (const h of allHits) {
  bySeverity[h.severity]++
  console.log(`  [${h.severity}] ${h.id} ${h.file}:${h.line ?? '?'} ${h.sample}`)
}
console.log('\nCounts:', bySeverity)
console.log(`JSON: ${path.relative(repoRoot, outPath)}`)

const failSeverity = allHits.some((h) => h.severity === 'critical' || h.severity === 'high')
process.exit(failSeverity ? 1 : 0)
