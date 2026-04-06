/**
 * Runs Playwright with forwarded argv, then deletes 'test-results/playwright-artifacts'.
 * The HTML reporter has already copied attachment bytes into 'playwright-report/data/', so
 * the per-test output tree is redundant on disk.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const pwArgs = process.argv.slice(2)
const r = spawnSync('npx', ['playwright', ...pwArgs], {
  cwd: root,
  env: process.env,
  shell: true,
  stdio: 'inherit'
})

const artifacts = path.join(root, 'test-results', 'playwright-artifacts')
try {
  fs.rmSync(artifacts, {
    recursive: true,
    force: true
  })
} catch {
  // ignore
}

process.exit(r.status === null ? 1 : r.status)
