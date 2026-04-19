/**
 * Runs Quasar Electron production build with output captured under test-results/quasar-build-electron-last.log.
 * The log must not live under dist/electron: Quasar clears that tree during the build and would delete it.
 * test-results/ is gitignored and is not removed by playwrightWithArtifactTrim.mjs (only playwright-artifacts is).
 * On success prints one line with the log path; on failure prints the full log to stderr.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const logPath = path.join(root, 'test-results', 'quasar-build-electron-last.log')
const distElectronPath = path.join(root, 'dist', 'electron')

/**
 * Quasar clears dist/electron with fs-extra removeSync; on Windows that can throw ENOTEMPTY when
 * another process briefly holds a handle, leaving a half-deleted tree and a follow-on ENOENT
 * under UnPackaged. Pre-remove with Node retries makes testbatch builds reliable.
 */
function removeDistElectronIfPresent () {
  if (!fs.existsSync(distElectronPath)) {
    return
  }
  fs.rmSync(distElectronPath, {
    force: true,
    maxRetries: 8,
    recursive: true,
    retryDelay: 250
  })
}

removeDistElectronIfPresent()

fs.mkdirSync(path.dirname(logPath), {
  recursive: true
})

const logStream = fs.createWriteStream(logPath)

const child = spawn('npx', ['quasar', 'build', '-m', 'electron', '--publish', 'never'], {
  cwd: root,
  env: process.env,
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe']
})

for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    logStream.write(chunk)
  })
}

let exitCode
try {
  exitCode = await new Promise((resolve, reject) => {
    child.on('error', (err) => {
      logStream.write(`\n[spawn error] ${String(err)}\n`)
      logStream.end(() => {
        reject(err)
      })
    })
    child.on('close', (code, signal) => {
      logStream.end(() => {
        if (signal !== null) {
          resolve(1)
          return
        }
        resolve(code === null ? 1 : code)
      })
    })
  })
} catch {
  try {
    process.stderr.write(fs.readFileSync(logPath, 'utf8'))
  } catch {
    process.stderr.write(`(no log file at ${logPath})\n`)
  }
  process.exit(1)
}

if (exitCode !== 0) {
  try {
    process.stderr.write(fs.readFileSync(logPath, 'utf8'))
  } catch {
    process.stderr.write(`(no log file at ${logPath})\n`)
  }
  process.exit(exitCode)
}

process.stdout.write(
  `Electron production build finished OK (full log: ${logPath})\n`
)
process.exit(0)
