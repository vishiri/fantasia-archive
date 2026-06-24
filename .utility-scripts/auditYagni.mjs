// YAGNI maintainer audit: inventory + heuristics (not a CI gate).
// Run: yarn audit:yagni [--inventory-only] [--jscpd] [--depcheck]
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')
const testResultsDir = path.join(repoRoot, 'test-results')

const INCLUDE_EXT = new Set([
  '.ts', '.vue', '.mjs', '.mts', '.cts', '.js', '.cjs',
  '.json', '.scss', '.css', '.sass', '.yaml', '.yml', '.html'
])
const EXCLUDE_EXT = new Set([
  '.md', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.eot'
])

const argv = process.argv.slice(2)
const inventoryOnly = argv.includes('--inventory-only')
const runJscpd = argv.includes('--jscpd')
const runDepcheck = argv.includes('--depcheck')

/** @typedef {{ id: string, severity: 'critical' | 'high' | 'medium' | 'low' | 'info', file: string, line?: number, sample: string, triage: 'pending' | 'fp' | 'fix' }} Hit */

/**
 * @param {string} relPath
 * @returns {string}
 */
function domainFor (relPath) {
  const p = relPath.replace(/\\/g, '/')
  if (p.startsWith('src/scripts/') || p.startsWith('src/stores/') || p.startsWith('src/boot/')) {
    return 'A-renderer-scripts'
  }
  if (p.startsWith('src/components/')) {
    return p.includes('/foundation/') ? 'J-tests-storybook' : 'B-components'
  }
  if (p.startsWith('src/layouts/') || p.startsWith('src/pages/') || p.startsWith('src/router/')) {
    return 'C-layouts-pages-router'
  }
  if (p.startsWith('src-electron/mainScripts/')) {
    return 'D-electron-main'
  }
  if (p.startsWith('src-electron/contentBridgeAPIs/') || p.startsWith('src-electron/electron-preload')) {
    return 'E-electron-preload-bridge'
  }
  if (p.startsWith('src-electron/')) {
    return 'D-electron-main'
  }
  if (p.startsWith('types/')) {
    return 'F-types'
  }
  if (p.startsWith('helpers/')) {
    return 'G-helpers'
  }
  if (p.startsWith('i18n/') && p.endsWith('.ts')) {
    return 'H-i18n-ts'
  }
  if (p.startsWith('vitest/') || p === 'package.json' || /^(eslint|vitest|quasar|playwright|commitlint|tsconfig)/.test(p)) {
    return 'I-configs'
  }
  if (p.startsWith('.utility-scripts/') || p.startsWith('eslint-rules/')) {
    return 'I-configs'
  }
  if (p.startsWith('.storybook-workspace/')) {
    return 'J-tests-storybook'
  }
  if (/_tests\/|\.vitest\.test\.|\.playwright\.|\.stories\.|playwright\.spec\.|e2e-tests\//.test(p)) {
    return 'J-tests-storybook'
  }
  if (p.startsWith('src/')) {
    return 'A-renderer-scripts'
  }
  return 'I-configs'
}

/**
 * @returns {string[]}
 */
function listGitTrackedInScope () {
  const result = spawnSync('git', ['ls-files'], {
    cwd: repoRoot,
    encoding: 'utf8'
  })
  if (result.status !== 0) {
    throw new Error(`git ls-files failed: ${result.stderr}`)
  }
  return result.stdout
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((rel) => {
      const ext = path.extname(rel).toLowerCase()
      if (EXCLUDE_EXT.has(ext)) {
        return false
      }
      return INCLUDE_EXT.has(ext)
    })
}

/**
 * @param {string[]} files
 */
function buildInventory (files) {
  /** @type {Record<string, string[]>} */
  const byDomain = {}
  for (const f of files) {
    const d = domainFor(f)
    if (!byDomain[d]) {
      byDomain[d] = []
    }
    byDomain[d].push(f)
  }
  for (const k of Object.keys(byDomain)) {
    byDomain[k].sort()
  }
  return {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    byDomain
  }
}

/**
 * @param {string[]} productionTs
 * @returns {Hit[]}
 */
function findReExportShims (productionTs) {
  const hits = []
  for (const rel of productionTs) {
    if (!rel.endsWith('.ts') && !rel.endsWith('.mjs')) {
      continue
    }
    const full = path.join(repoRoot, rel)
    if (!fs.existsSync(full)) {
      continue
    }
    const text = fs.readFileSync(full, 'utf8').trim()
    if (/^export \{[^}]+\} from ['"]/.test(text) && !text.includes('export type') && text.split('\n').length <= 3) {
      if (rel.endsWith('_manager.ts')) {
        continue
      }
      hits.push({
        id: 'Y5-shim',
        severity: 'low',
        file: rel,
        sample: text.split('\n')[0],
        triage: 'pending'
      })
    }
  }
  return hits
}

/**
 * @param {string[]} tsVueFiles
 * @returns {Hit[]}
 */
function findDuplicateBasenames (tsVueFiles) {
  const roots = ['src/scripts/', 'helpers/', 'src-electron/shared/', 'src-electron/mainScripts/']
  /** @type {Map<string, string[]>} */
  const byBase = new Map()
  for (const rel of tsVueFiles) {
    const norm = rel.replace(/\\/g, '/')
    if (!roots.some((r) => norm.startsWith(r))) {
      continue
    }
    if (!/\.(ts|mjs)$/.test(norm) || norm.includes('/_tests/') || norm.includes('/functions/')) {
      continue
    }
    const base = path.basename(norm, path.extname(norm))
    if (base.endsWith('_manager') || base.endsWith('.vitest.test')) {
      continue
    }
    const list = byBase.get(base) ?? []
    list.push(norm)
    byBase.set(base, list)
  }
  const hits = []
  for (const [base, paths] of byBase) {
    if (paths.length < 2) {
      continue
    }
    const domains = new Set(paths.map((p) => p.split('/')[0]))
    if (domains.size < 2) {
      continue
    }
    hits.push({
      id: 'Y2-duplicate',
      severity: 'medium',
      file: paths[0],
      sample: `basename "${base}" in: ${paths.join(', ')}`,
      triage: 'pending'
    })
  }
  return hits
}

/**
 * @param {string[]} vueFiles
 * @returns {Hit[]}
 */
function findThinVueCandidates (vueFiles) {
  const hits = []
  const scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/
  for (const rel of vueFiles) {
    if (rel.includes('/foundation/') || rel.includes('/_tests/')) {
      continue
    }
    const full = path.join(repoRoot, rel)
    if (!fs.existsSync(full)) {
      continue
    }
    const text = fs.readFileSync(full, 'utf8')
    const sm = text.match(scriptRe)
    if (!sm) {
      continue
    }
    const scriptLines = sm[1].split('\n').filter((l) => l.trim() && !l.trim().startsWith('//')).length
    if (scriptLines > 25) {
      continue
    }
    const template = text.match(/<template>([\s\S]*?)<\/template>/)?.[1] ?? ''
    const childTags = (template.match(/<[A-Za-z][\w-]*/g) ?? []).filter((t) => !t.startsWith('</'))
    if (childTags.length <= 2) {
      hits.push({
        id: 'Y6-wrapper',
        severity: 'info',
        file: rel,
        sample: `thin script (${scriptLines} lines), ~${childTags.length} template tag(s) — manual review`,
        triage: 'pending'
      })
    }
  }
  return hits
}

/**
 * @param {string[]} tsFiles
 * @returns {Hit[]}
 */
function findLikelyUnusedProductionFiles (tsFiles) {
  const hits = []
  const candidates = tsFiles.filter((rel) => {
    const n = rel.replace(/\\/g, '/')
    if (!/\.(ts|mjs)$/.test(n)) {
      return false
    }
    if (/_tests\/|\.vitest\.|\.playwright\.|\.stories\.|vitest\/|\.utility-scripts\/|eslint-rules\//.test(n)) {
      return false
    }
    if (n.endsWith('.d.ts') || n.endsWith('env.d.ts')) {
      return false
    }
    if (n.includes('/functions/') || n.endsWith('_manager.ts') || n.endsWith('index.ts')) {
      return false
    }
    return n.startsWith('src/') || n.startsWith('src-electron/') || n.startsWith('helpers/')
  })

  for (const rel of candidates) {
    const base = path.basename(rel, path.extname(rel))
    const grep = spawnSync(
      'git',
      ['grep', '-l', base, '--', 'src', 'src-electron', 'helpers', 'types', 'i18n', 'e2e-tests'],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    )
    const matches = (grep.stdout || '').split('\n').map((l) => l.trim()).filter(Boolean)
    const others = matches.filter((m) => m.replace(/\\/g, '/') !== rel.replace(/\\/g, '/'))
    if (matches.length <= 1 && matches[0]?.replace(/\\/g, '/') === rel.replace(/\\/g, '/')) {
      hits.push({
        id: 'Y1-unnecessary',
        severity: 'medium',
        file: rel,
        sample: `no importers found for basename "${base}" (confirm manually)`,
        triage: 'pending'
      })
    } else if (others.length === 0 && matches.length === 1) {
      hits.push({
        id: 'Y1-unnecessary',
        severity: 'low',
        file: rel,
        sample: `only self-match for "${base}"`,
        triage: 'pending'
      })
    }
  }
  return hits
}

/**
 * @returns {Hit[]}
 */
function findSpeculativeMarkers () {
  const hits = []
  const grep = spawnSync(
    'git',
    ['grep', '-n', '-E', 'TODO.*(future|later|v2|WIP)|FIXME.*(future|hack)|@deprecated', '--', 'src', 'src-electron', 'helpers'],
    {
      cwd: repoRoot,
      encoding: 'utf8'
    }
  )
  if (grep.status !== 0 && grep.status !== 1) {
    return hits
  }
  for (const line of (grep.stdout || '').split('\n').filter(Boolean)) {
    const colon = line.indexOf(':')
    const second = line.indexOf(':', colon + 1)
    if (colon < 0 || second < 0) {
      continue
    }
    const file = line.slice(0, colon)
    const lineNum = Number(line.slice(colon + 1, second))
    const sample = line.slice(second + 1).trim().slice(0, 120)
    hits.push({
      id: 'Y7-speculative',
      severity: 'info',
      file: file.replace(/\\/g, '/'),
      line: lineNum,
      sample,
      triage: 'pending'
    })
  }
  return hits
}

/**
 * @param {Hit[]} hits
 */
function writeScanReport (hits, inventory) {
  fs.mkdirSync(testResultsDir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const scanPath = path.join(testResultsDir, `yagni-scan-${ts}.json`)
  const latestPath = path.join(testResultsDir, 'yagni-scan-latest.json')
  const payload = {
    generatedAt: new Date().toISOString(),
    inventorySummary: {
      totalFiles: inventory.totalFiles,
      domains: Object.keys(inventory.byDomain)
    },
    hitCount: hits.length,
    hits
  }
  fs.writeFileSync(scanPath, JSON.stringify(payload, null, 2))
  fs.writeFileSync(latestPath, JSON.stringify(payload, null, 2))
  return scanPath
}

function runOptionalJscpd () {
  console.log('\n--- jscpd (optional) ---')
  const outDir = path.join(testResultsDir, 'jscpd')
  const result = spawnSync(
    'npx',
    ['--yes', 'jscpd', '--min-lines', '10', '--min-tokens', '50', '--reporters', 'json', '--output', outDir, 'src', 'src-electron', 'helpers', 'types'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: true
    }
  )
  console.log(result.stdout || result.stderr || '(jscpd finished)')
  return result.status === 0
}

function runOptionalDepcheck () {
  console.log('\n--- depcheck (optional) ---')
  const result = spawnSync('npx', ['--yes', 'depcheck', '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: true
  })
  const outPath = path.join(testResultsDir, 'yagni-depcheck.json')
  if (result.stdout) {
    fs.writeFileSync(outPath, result.stdout)
    console.log(`Wrote ${path.relative(repoRoot, outPath)}`)
  } else {
    console.log(result.stderr || 'depcheck produced no output')
  }
  return result.status === 0
}

// --- main ---
const files = listGitTrackedInScope()
const inventory = buildInventory(files)
fs.mkdirSync(testResultsDir, { recursive: true })
const inventoryPath = path.join(testResultsDir, 'yagni-inventory.json')
fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2))
console.log(`YAGNI inventory: ${inventory.totalFiles} files → ${path.relative(repoRoot, inventoryPath)}`)
for (const [d, list] of Object.entries(inventory.byDomain).sort()) {
  console.log(`  ${d}: ${list.length}`)
}

if (inventoryOnly) {
  process.exit(0)
}

/** @type {Hit[]} */
const allHits = []
const productionTs = files.filter((f) => /\.(ts|mjs)$/.test(f) && !/_tests\/|\.vitest\.|\.playwright\.|\.stories\./.test(f))
const vueFiles = files.filter((f) => f.endsWith('.vue'))

allHits.push(...findReExportShims(productionTs))
allHits.push(...findDuplicateBasenames(productionTs))
allHits.push(...findThinVueCandidates(vueFiles))
allHits.push(...findSpeculativeMarkers())
console.log('\nScanning likely-unused production files (may take a minute)...')
allHits.push(...findLikelyUnusedProductionFiles(productionTs))

if (runJscpd) {
  runOptionalJscpd()
}
if (runDepcheck) {
  runOptionalDepcheck()
}

const scanPath = writeScanReport(allHits, inventory)
console.log(`\nYAGNI scan: ${allHits.length} hit(s) → ${path.relative(repoRoot, scanPath)}`)
const byId = {}
for (const h of allHits) {
  byId[h.id] = (byId[h.id] ?? 0) + 1
}
console.log('By id:', byId)
for (const h of allHits.filter((x) => x.severity === 'high' || x.severity === 'medium').slice(0, 40)) {
  console.log(`  [${h.severity}] ${h.id} ${h.file}: ${h.sample}`)
}
if (allHits.filter((x) => x.severity === 'high' || x.severity === 'medium').length > 40) {
  console.log('  … (see JSON for full list)')
}

process.exit(0)
