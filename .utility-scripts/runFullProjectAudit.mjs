// Full project audit orchestrator (non-blocking by default).
// Run: node .utility-scripts/runFullProjectAudit.mjs [--strict] [--phase N]
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')
const testResultsDir = path.join(repoRoot, 'test-results')
const logPath = path.join(
  testResultsDir,
  `full-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
)

const strict = process.argv.includes('--strict')
const phaseArg = process.argv.find((a) => a.startsWith('--phase='))
const phaseOnly = phaseArg ? Number(phaseArg.split('=')[1]) : null

/** @type {{ id: number, name: string, cmd: string, args: string[], cwd?: string, optional?: boolean }[]} */
const steps = [
  {
    id: 0,
    name: 'testbatch:verify',
    cmd: 'yarn',
    args: ['testbatch:verify']
  },
  {
    id: 0,
    name: 'audit:yagni',
    cmd: 'yarn',
    args: ['audit:yagni'],
    optional: true
  },
  {
    id: 0,
    name: 'audit:quasar-component-tokens',
    cmd: 'yarn',
    args: ['audit:quasar-component-tokens']
  },
  {
    id: 1,
    name: 'yarn audit root',
    cmd: 'yarn',
    args: ['audit', '--level', 'moderate'],
    optional: true
  },
  {
    id: 1,
    name: 'domainPolicyGrep',
    cmd: 'node',
    args: ['.utility-scripts/domainPolicyGrep.mjs']
  },
  {
    id: 2,
    name: 'jscpd',
    cmd: 'npx',
    args: ['--yes', 'jscpd', '--min-lines', '10', '--min-tokens', '50', '--reporters', 'json', '--output', 'test-results/jscpd', 'src', 'src-electron', 'helpers'],
    optional: true
  },
  {
    id: 3,
    name: 'domainPolicyGrep-recheck',
    cmd: 'node',
    args: ['.utility-scripts/domainPolicyGrep.mjs'],
    optional: true
  }
]

fs.mkdirSync(testResultsDir, { recursive: true })
const logLines = [`Full project audit started ${new Date().toISOString()}`, '']

let criticalFailures = 0

for (const step of steps) {
  if (phaseOnly !== null && step.id !== phaseOnly) {
    continue
  }
  logLines.push(`--- ${step.name} ---`)
  const result = spawnSync(step.cmd, step.args, {
    cwd: step.cwd ? path.join(repoRoot, step.cwd) : repoRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 20 * 1024 * 1024
  })
  const out = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
  logLines.push(out.slice(-8000))
  logLines.push(`exit: ${result.status ?? 'null'}`)
  logLines.push('')
  if (result.status !== 0 && !step.optional) {
    criticalFailures++
  }
}

fs.writeFileSync(logPath, logLines.join('\n'))
console.log(`Audit log: ${path.relative(repoRoot, logPath)}`)
console.log(`Critical failures: ${criticalFailures}`)
process.exit(strict && criticalFailures > 0 ? 1 : 0)
