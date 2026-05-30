import { expect, test, vi } from 'vitest'

import {
  finalizeFaActiveProjectOpenResult,
  tryReuseFaActiveProjectKnownPath
} from 'app/src/scripts/projectManagement/projectManagement_manager'

/**
 * faActiveProjectOpenFlow
 * finalizeFaActiveProjectOpenResult returns reused for idempotent IPC opens.
 */
test('Test that finalizeFaActiveProjectOpenResult returns reused when idempotentReuse is set', async () => {
  const reuse = vi.fn()
  const commit = vi.fn()
  const r = await finalizeFaActiveProjectOpenResult({
    idempotentReuse: true,
    outcome: 'opened',
    project: {
      filePath: 'D:\\a.faproject',
      id: 'id-1',
      name: 'A'
    }
  }, {
    commitActiveProjectSnapshot: commit,
    reuseActiveProjectSession: reuse
  })
  expect(r).toBe('reused')
  expect(reuse).toHaveBeenCalledOnce()
  expect(commit).not.toHaveBeenCalled()
})

/**
 * faActiveProjectOpenFlow
 * tryReuseFaActiveProjectKnownPath returns reused for matching paths without IPC.
 */
test('Test that tryReuseFaActiveProjectKnownPath returns reused for the same file path', () => {
  const reuse = vi.fn()
  const snap = {
    filePath: 'D:\\same.faproject',
    id: 'id-1',
    name: 'Same'
  }
  const r = tryReuseFaActiveProjectKnownPath(snap, 'd:\\same.faproject', reuse)
  expect(r).toBe('reused')
  expect(reuse).toHaveBeenCalledWith(snap)
})

/**
 * faActiveProjectOpenFlow
 * tryReuseFaActiveProjectKnownPath returns null when no project is active.
 */
test('Test that tryReuseFaActiveProjectKnownPath returns null without an active project', () => {
  const reuse = vi.fn()
  const r = tryReuseFaActiveProjectKnownPath(null, 'D:\\x.faproject', reuse)
  expect(r).toBeNull()
  expect(reuse).not.toHaveBeenCalled()
})

/**
 * faActiveProjectOpenFlow
 * tryReuseFaActiveProjectKnownPath returns null when paths differ.
 */
test('Test that tryReuseFaActiveProjectKnownPath returns null for a different file path', () => {
  const reuse = vi.fn()
  const snap = {
    filePath: 'D:\\one.faproject',
    id: 'id-1',
    name: 'One'
  }
  const r = tryReuseFaActiveProjectKnownPath(snap, 'D:\\two.faproject', reuse)
  expect(r).toBeNull()
  expect(reuse).not.toHaveBeenCalled()
})

/**
 * faActiveProjectOpenFlow
 * finalizeFaActiveProjectOpenResult returns opened for a fresh IPC open.
 */
test('Test that finalizeFaActiveProjectOpenResult returns opened for a normal open', async () => {
  const reuse = vi.fn()
  const commit = vi.fn()
  const r = await finalizeFaActiveProjectOpenResult({
    outcome: 'opened',
    project: {
      filePath: 'D:\\a.faproject',
      id: 'id-1',
      name: 'A'
    }
  }, {
    commitActiveProjectSnapshot: commit,
    reuseActiveProjectSession: reuse
  })
  expect(r).toBe('opened')
  expect(commit).toHaveBeenCalledOnce()
})
