import { expect, test, vi } from 'vitest'

import type { WebContents } from 'electron'

function buildDwCStub (behavior: Array<boolean | 'throw'>): { dwc: unknown, exe: ReturnType<typeof vi.fn> } {
  let i = 0
  const executeJavaScript = vi.fn((_script: string) => {
    const next = behavior[i]
    i += 1
    if (next === 'throw') {
      return Promise.reject(new Error('injected'))
    }
    return Promise.resolve(next ?? false)
  })
  const dwc = {
    executeJavaScript
  }
  return {
    dwc,
    exe: executeJavaScript
  }
}

/**
 * revealElectronDevToolsConsoleBestEffort
 * Resolves true when embedded DevTools script reports the panel switched.
 */
test('Test that revealElectronDevToolsConsoleBestEffort succeeds on first embedded script truthy result', async () => {
  const { dwc, exe } = buildDwCStub([true])
  const wc = {
    devToolsWebContents: dwc
  }

  vi.resetModules()
  const { revealElectronDevToolsConsoleBestEffort } = await import('../revealElectronDevToolsConsoleBestEffort')
  await expect(revealElectronDevToolsConsoleBestEffort(wc as unknown as WebContents)).resolves.toBe(true)

  expect(exe).toHaveBeenCalledTimes(1)
})

/**
 * revealElectronDevToolsConsoleBestEffort
 * Keeps polling when the Chromium helper returns false or throws once.
 */
test('Test that revealElectronDevToolsConsoleBestEffort retries before success', async () => {
  const { dwc, exe } = buildDwCStub([
    false,
    'throw',
    true
  ])
  const wc = {
    devToolsWebContents: dwc
  }

  vi.resetModules()
  const { revealElectronDevToolsConsoleBestEffort } = await import('../revealElectronDevToolsConsoleBestEffort')
  await expect(revealElectronDevToolsConsoleBestEffort(wc as unknown as WebContents)).resolves.toBe(true)

  expect(exe).toHaveBeenCalledTimes(3)
})

/**
 * revealElectronDevToolsConsoleBestEffort
 * Polls until devToolsWebContents exists when Electron assigns it lazily after openDevTools().
 */
test('Test that revealElectronDevToolsConsoleBestEffort waits for lazy devTools WebContents attachment', async () => {
  const { dwc, exe } = buildDwCStub([true])
  let opens = 0
  const wc = {
    get devToolsWebContents (): unknown {
      opens += 1
      return opens < 4 ? undefined : dwc
    }
  }

  vi.resetModules()
  const { revealElectronDevToolsConsoleBestEffort } = await import('../revealElectronDevToolsConsoleBestEffort')
  await expect(revealElectronDevToolsConsoleBestEffort(wc as unknown as WebContents)).resolves.toBe(true)

  expect(exe).toHaveBeenCalledTimes(1)
})

/**
 * revealElectronDevToolsConsoleBestEffort
 * Resolves false when DevTools never expose a webContents target.
 */
test('Test that revealElectronDevToolsConsoleBestEffort exhausts attempts without devTools WebContents', async () => {
  const wc = {} as Record<string, unknown>
  Reflect.defineProperty(wc, 'devToolsWebContents', {
    configurable: true,
    get (): undefined {
      return undefined
    }
  })

  vi.useFakeTimers()
  vi.resetModules()
  const { revealElectronDevToolsConsoleBestEffort } = await import('../revealElectronDevToolsConsoleBestEffort')
  const resultPromise = revealElectronDevToolsConsoleBestEffort(wc as unknown as WebContents)
  await vi.advanceTimersByTimeAsync(2000)
  await expect(resultPromise).resolves.toBe(false)
  vi.useRealTimers()
})
