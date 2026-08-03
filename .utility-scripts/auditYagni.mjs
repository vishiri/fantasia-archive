// YAGNI maintainer audit: inventory + heuristics (not a CI gate).
// Run: yarn audit:yagni [--inventory-only] [--jscpd] [--depcheck]
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import {
  buildInventory,
  findDuplicateBasenames,
  findLikelyUnusedProductionFiles,
  findReExportShims,
  findSpeculativeMarkers,
  findThinVueCandidates,
  listGitTrackedInScope,
  repoRoot,
  testResultsDir
} from './auditYagniShared.mjs'

const argv = process.argv.slice(2)
const inventoryOnly = argv.includes('--inventory-only')
const runJscpd = argv.includes('--jscpd')
const runDepcheck = argv.includes('--depcheck')

/** @typedef {{ id: string, severity: 'critical' | 'high' | 'medium' | 'low' | 'info', file: string, line?: number, sample: string, triage: 'pending' | 'fp' | 'fix' }} Hit */

/**
 * @param {Hit[]} hits
 * @param {{ totalFiles: number, byDomain: Record<string, string[]> }} inventory
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
