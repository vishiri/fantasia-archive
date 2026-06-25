import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, expect, test } from 'vitest'

import { createResolveHardenedFaProjectFilePath } from '../faProjectFilePathHardening'
import { pathLooksLikeFaProjectFile } from '../../projectManagementSharedPathWiring'

const { resolveHardenedFaProjectFilePath } = createResolveHardenedFaProjectFilePath({
  pathLooksLikeFaProjectFile,
  realpathSync: (path) => fs.realpathSync(path),
  statSync: (path) => fs.statSync(path)
})

const createdPaths: string[] = []

afterEach(() => {
  for (const p of createdPaths.splice(0)) {
    try {
      fs.rmSync(p, {
        force: true,
        recursive: true
      })
    } catch {
      // best-effort cleanup
    }
  }
})

function track (p: string): string {
  createdPaths.push(p)
  return p
}

/**
 * resolveHardenedFaProjectFilePath
 * Rejects when resolved real path no longer looks like a .faproject file.
 */
test('Test that resolveHardenedFaProjectFilePath rejects when real path fails extension check', () => {
  const { resolveHardenedFaProjectFilePath } = createResolveHardenedFaProjectFilePath({
    pathLooksLikeFaProjectFile: (candidate) => candidate.endsWith('.faproject'),
    realpathSync: () => '/tmp/notes.txt',
    statSync: () => ({ isFile: () => true })
  })

  expect(resolveHardenedFaProjectFilePath('/tmp/alias.faproject')).toBeNull()
})

/**
 * resolveHardenedFaProjectFilePath
 * Returns real path for an existing regular .faproject file.
 */
test('Test that resolveHardenedFaProjectFilePath returns real path for regular file', () => {
  const dir = track(fs.mkdtempSync(path.join(os.tmpdir(), 'fa-proj-harden-')))
  const filePath = path.join(dir, 'sample.faproject')
  fs.writeFileSync(filePath, 'x')

  expect(resolveHardenedFaProjectFilePath(filePath)).toBe(fs.realpathSync(filePath))
})

/**
 * resolveHardenedFaProjectFilePath
 * Rejects directories even when extension matches.
 */
test('Test that resolveHardenedFaProjectFilePath rejects directories', () => {
  const dir = track(fs.mkdtempSync(path.join(os.tmpdir(), 'fa-proj-harden-')))
  const fakeProjectDir = path.join(dir, 'folder.faproject')
  fs.mkdirSync(fakeProjectDir)

  expect(resolveHardenedFaProjectFilePath(fakeProjectDir)).toBeNull()
})

/**
 * resolveHardenedFaProjectFilePath
 * Rejects missing paths.
 */
test('Test that resolveHardenedFaProjectFilePath rejects missing paths', () => {
  const dir = track(fs.mkdtempSync(path.join(os.tmpdir(), 'fa-proj-harden-')))
  const missing = path.join(dir, 'missing.faproject')

  expect(resolveHardenedFaProjectFilePath(missing)).toBeNull()
})

/**
 * resolveHardenedFaProjectFilePath
 * Rejects symlinks whose real path is not a .faproject file.
 */
test('Test that resolveHardenedFaProjectFilePath rejects symlink to non-project file', () => {
  const dir = track(fs.mkdtempSync(path.join(os.tmpdir(), 'fa-proj-harden-')))
  const target = path.join(dir, 'notes.txt')
  const linkPath = path.join(dir, 'alias.faproject')
  fs.writeFileSync(target, 'x')

  try {
    fs.symlinkSync(target, linkPath, 'file')
  } catch {
    return
  }

  expect(resolveHardenedFaProjectFilePath(linkPath)).toBeNull()
})
