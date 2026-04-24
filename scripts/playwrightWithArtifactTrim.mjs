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

/**
 * `package.json` uses `test src/components/%npm_config_component%` (npm). Yarn on Windows does not
 * expand that token, and `--component=...` was being forwarded to Playwright (unknown option).
 * Strip `--component` / `--component=…`, set the path to `src/components/<relative>`, and fall
 * back to `process.env.npm_config_component` when npm sets it.
 */
function normalizePlaywrightCliArgs (argv) {
  let fromFlag = null
  const out = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--component' && argv[i + 1] !== undefined) {
      fromFlag = argv[i + 1].split(/[/\\]/).filter(Boolean)
      i++
      continue
    }
    if (a.startsWith('--component=')) {
      fromFlag = a.slice('--component='.length).split(/[/\\]/).filter(Boolean)
      continue
    }
    out.push(a)
  }

  const fromEnv = process.env.npm_config_component
  const envSegments = typeof fromEnv === 'string' && fromEnv.length > 0
    ? fromEnv.split(/[/\\]/).filter(Boolean)
    : null
  const segments = fromFlag ?? envSegments
  if (segments === null) {
    for (const arg of out) {
      if (String(arg).includes('%npm_config_component%')) {
        console.error(
          '[playwrightWithArtifactTrim] Path still contains %npm_config_component% (not expanded on Yarn for Windows).\n' +
            '  Use:  yarn test:components:single --component=bucket/ComponentFolder\n' +
            '  Or:   node scripts/playwrightWithArtifactTrim.mjs test src/components/bucket/ComponentFolder\n'
        )
        process.exit(1)
      }
    }
    return out
  }

  const targetPath = path.join('src', 'components', ...segments).replace(/\\/g, '/')
  const testIdx = out.indexOf('test')
  if (testIdx === -1) {
    return ['test', targetPath, ...out]
  }
  if (fromFlag !== null) {
    const next = [...out]
    next[testIdx + 1] = targetPath
    return next
  }
  const pathArg = out[testIdx + 1]
  if (pathArg === undefined || String(pathArg).includes('%npm_config_component%')) {
    const next = [...out]
    next[testIdx + 1] = targetPath
    return next
  }
  return out
}

const pwArgs = normalizePlaywrightCliArgs(process.argv.slice(2))
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
