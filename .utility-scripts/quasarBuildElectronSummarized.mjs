/**
 * Runs Quasar Electron production build with output captured under test-results/quasar-build-electron-last.log.
 * The log must not live under dist/electron: Quasar clears that tree during the build and would delete it.
 * test-results/ is gitignored and is not removed by playwrightWithArtifactTrim.mjs (only playwright-artifacts is).
 * On success prints one line with the log path; on failure prints the full log to stderr.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Result, ResultAsync } from 'neverthrow'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const logPath = path.join(root, 'test-results', 'quasar-build-electron-last.log')
const distElectronPath = path.join(root, 'dist', 'electron')

/**
 * Quasar clears dist/electron with fs-extra removeSync; on Windows that can throw ENOTEMPTY when
 * another process briefly holds a handle, leaving a half-deleted tree and a follow-on ENOENT
 * under UnPackaged. Pre-remove with Node retries makes testbatch builds reliable.
 * electron-builder then renames win-unpacked.tmp. A workspace file watcher can lock
 * that folder and the rename fails with EPERM. The build therefore writes outside
 * the repo, then copies UnPackaged back to dist/electron for Playwright.
 */
const unlockedDistPath = path.join(os.tmpdir(), 'fantasia-archive-electron-build')

function removeDistElectronIfPresent () {
  if (!fs.existsSync(distElectronPath)) {
    return true
  }
  const remove = Result.fromThrowable(
    () => {
      fs.rmSync(distElectronPath, {
        force: true,
        maxRetries: 8,
        recursive: true,
        retryDelay: 250
      })
    },
    (error) => error
  )
  return remove().isOk()
}

function useUnlockedDistOutsideWorkspace () {
  removeDistElectronIfPresent()
  fs.rmSync(unlockedDistPath, {
    force: true,
    maxRetries: 8,
    recursive: true,
    retryDelay: 250
  })
  process.env.FA_QUASAR_DIST_DIR = unlockedDistPath
}

function mirrorUnlockedUnpackagedForPlaywright () {
  const unpackagedSource = path.join(unlockedDistPath, 'UnPackaged')
  const unpackagedDest = path.join(distElectronPath, 'UnPackaged')
  fs.cpSync(unpackagedSource, unpackagedDest, {
    recursive: true
  })
}

useUnlockedDistOutsideWorkspace()

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

const exitOutcome = await ResultAsync.fromPromise(
  new Promise((resolve, reject) => {
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
  }),
  (e) => e
)

function writeStderrLogOrPlaceholder () {
  const read = Result.fromThrowable(
    () => fs.readFileSync(logPath, 'utf8'),
    () => null
  )()
  if (read.isOk()) {
    process.stderr.write(read.value)
    return
  }
  process.stderr.write(`(no log file at ${logPath})\n`)
}

if (exitOutcome.isErr()) {
  writeStderrLogOrPlaceholder()
  process.exit(1)
}

const exitCode = exitOutcome.value

if (exitCode !== 0) {
  writeStderrLogOrPlaceholder()
  process.exit(exitCode)
}

mirrorUnlockedUnpackagedForPlaywright()

process.stdout.write(
  `Electron production build finished OK (full log: ${logPath})\n`
)
process.exit(0)
