import { beforeEach, expect, test, vi } from 'vitest'

const fsMock = vi.hoisted(() => ({
  existsSync: vi.fn(),
  statSync: vi.fn()
}))

vi.mock('node:fs', () => {
  return {
    default: {
      existsSync: (...args: unknown[]) => fsMock.existsSync(...args),
      statSync: (...args: unknown[]) => fsMock.statSync(...args)
    },
    existsSync: (...args: unknown[]) => fsMock.existsSync(...args),
    statSync: (...args: unknown[]) => fsMock.statSync(...args)
  }
})

type I_recentFile = { recentProjects: Array<{ filePath: string, name: string }> }

const ElectronStoreMock = vi.hoisted(() => vi.fn())

vi.mock('electron-store', () => {
  return {
    default: ElectronStoreMock
  }
})

beforeEach(async () => {
  vi.resetModules()
  ElectronStoreMock.mockClear()
  ElectronStoreMock.mockImplementation(function (
    this: unknown,
    opts: { defaults: I_recentFile }
  ) {
    const state = {
      recentProjects: [...opts.defaults.recentProjects] as Array<{ filePath: string, name: string }>
    }
    return {
      get (k: keyof I_recentFile): unknown {
        return state[k]
      },
      set (k: keyof I_recentFile, v: unknown): void {
        if (k === 'recentProjects') {
          state.recentProjects = v as typeof state.recentProjects
        }
      }
    }
  })
  fsMock.existsSync.mockReset()
  fsMock.statSync.mockReset()
  fsMock.existsSync.mockReturnValue(true)
  fsMock.statSync.mockReturnValue({ isFile: (): boolean => true })
})

test('Test that getFaRecentProjectListStore is a lazy singleton', async () => {
  const { getFaRecentProjectListStore } = await import('../faRecentProjectListRuntime')
  const first = getFaRecentProjectListStore()
  const second = getFaRecentProjectListStore()
  expect(first).toBe(second)
  expect(ElectronStoreMock).toHaveBeenCalledTimes(1)
  expect(ElectronStoreMock.mock.calls[0][0]).toMatchObject({ name: 'faRecentProjectList' })
})

test('Test that getRecentProjectsSnapshot returns sanitized rows and persists repairs', async () => {
  const mod = await import('../faRecentProjectListRuntime')
  mod.getFaRecentProjectListStore().set('recentProjects', [
    {
      filePath: 'D:\\bad.txt',
      name: 'X'
    },
    {
      filePath: 'D:\\ok.faproject',
      name: 'Good'
    }
  ])
  const out = mod.getRecentProjectsSnapshot()
  expect(out).toEqual([{
    filePath: 'D:\\ok.faproject',
    name: 'Good'
  }])
  expect(mod.getFaRecentProjectListStore().get('recentProjects')).toEqual(out)
})

test('Test that recordRecentProjectEntry prepends and re-sanitizes', async () => {
  const mod = await import('../faRecentProjectListRuntime')
  mod.getFaRecentProjectListStore().set('recentProjects', [
    {
      filePath: 'D:\\old.faproject',
      name: 'Old'
    }
  ])
  mod.recordRecentProjectEntry({
    filePath: 'D:\\new.faproject',
    name: 'New'
  })
  const rows = mod.getFaRecentProjectListStore().get('recentProjects') as Array<{
    filePath: string
    name: string
  }>
  expect(rows[0]).toEqual({
    filePath: 'D:\\new.faproject',
    name: 'New'
  })
})

test('Test that removeRecentProjectEntryByPath filters then sanitizes', async () => {
  const mod = await import('../faRecentProjectListRuntime')
  mod.getFaRecentProjectListStore().set('recentProjects', [
    {
      filePath: 'D:\\a.faproject',
      name: 'A'
    },
    {
      filePath: 'D:\\b.faproject',
      name: 'B'
    }
  ])
  mod.removeRecentProjectEntryByPath('D:\\a.faproject')
  const rows = mod.getFaRecentProjectListStore().get('recentProjects') as Array<{ name: string }>
  expect(rows.some((r) => r.name === 'A')).toBe(false)
})

test('Test that second snapshot avoids persist when sanitized list matches store', async () => {
  const mod = await import('../faRecentProjectListRuntime')
  const clean = [
    {
      filePath: 'D:\\ok.faproject',
      name: 'OK'
    }
  ]
  mod.getFaRecentProjectListStore().set('recentProjects', clean)
  mod.getRecentProjectsSnapshot()
  const setSpy = vi.spyOn(mod.getFaRecentProjectListStore(), 'set')
  mod.getRecentProjectsSnapshot()
  expect(setSpy).not.toHaveBeenCalled()
  setSpy.mockRestore()
})
