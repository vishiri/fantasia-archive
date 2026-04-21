import {
  test,
  expect,
  vi,
  beforeEach
} from 'vitest'

const {
  appMock,
  appWhenReadyResolved,
  netFetchMock,
  protocolHandleMock,
  protocolRegisterSchemesAsPrivilegedMock,
  whenReadyDeferred
} = vi.hoisted(() => {
  const fetchMock = vi.fn(async (_url: unknown) => new Response('ok'))
  const registerSchemesMock = vi.fn((_schemes: unknown[]) => {})
  const handleMock = vi.fn((_scheme: string, _handler: (request: { url: string }) => Promise<Response>) => {})

  const whenReadyState: { resolve: () => void, promise: Promise<void> } = {
    promise: Promise.resolve(),
    resolve: () => {}
  }

  return {
    appMock: {
      whenReady: vi.fn(() => whenReadyState.promise)
    },
    appWhenReadyResolved: vi.fn(),
    netFetchMock: fetchMock,
    protocolHandleMock: handleMock,
    protocolRegisterSchemesAsPrivilegedMock: registerSchemesMock,
    whenReadyDeferred: whenReadyState
  }
})

vi.mock('electron', () => {
  return {
    app: appMock,
    net: { fetch: netFetchMock },
    protocol: {
      handle: protocolHandleMock,
      registerSchemesAsPrivileged: protocolRegisterSchemesAsPrivilegedMock
    }
  }
})

beforeEach(async () => {
  appMock.whenReady.mockClear()
  protocolRegisterSchemesAsPrivilegedMock.mockReset()
  protocolHandleMock.mockReset()
  netFetchMock.mockReset()
  netFetchMock.mockImplementation(async (_url: unknown) => new Response('ok'))
  appWhenReadyResolved.mockReset()

  whenReadyDeferred.promise = new Promise<void>((resolve) => {
    whenReadyDeferred.resolve = resolve
  })

  vi.resetModules()
})

/**
 * registerFaAppProtocolAsPrivileged
 * Registers the 'app' scheme as privileged with secure / standard / fetch / cors / stream privileges.
 */
test('Test that registerFaAppProtocolAsPrivileged registers app scheme with secure privileged flags', async () => {
  const mod = await import('../registerFaAppProtocol')
  mod.registerFaAppProtocolAsPrivileged()

  expect(protocolRegisterSchemesAsPrivilegedMock).toHaveBeenCalledTimes(1)
  expect(protocolRegisterSchemesAsPrivilegedMock).toHaveBeenCalledWith([
    {
      scheme: 'app',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true
      }
    }
  ])
})

/**
 * registerFaAppProtocolAsPrivileged
 * Idempotent: calling twice still only registers once.
 */
test('Test that registerFaAppProtocolAsPrivileged is idempotent', async () => {
  const mod = await import('../registerFaAppProtocol')
  mod.registerFaAppProtocolAsPrivileged()
  mod.registerFaAppProtocolAsPrivileged()

  expect(protocolRegisterSchemesAsPrivilegedMock).toHaveBeenCalledTimes(1)
})

/**
 * installFaAppProtocolHandler
 * Registers a handler for the 'app' scheme exactly once.
 */
test('Test that installFaAppProtocolHandler installs the app scheme handler once', async () => {
  const mod = await import('../registerFaAppProtocol')
  mod.installFaAppProtocolHandler()
  mod.installFaAppProtocolHandler()

  expect(protocolHandleMock).toHaveBeenCalledTimes(1)
  expect(protocolHandleMock.mock.calls[0]?.[0]).toBe('app')
})

/**
 * installFaAppProtocolHandler
 * Forwards normal in-root requests to net.fetch using a 'file://' URL.
 */
test('Test that installFaAppProtocolHandler forwards in-root requests to net.fetch', async () => {
  const mod = await import('../registerFaAppProtocol')
  mod.installFaAppProtocolHandler()

  const handler = protocolHandleMock.mock.calls[0]?.[1] as (request: { url: string }) => Promise<Response>
  expect(typeof handler).toBe('function')

  const response = await handler({ url: 'app://./index.html' })

  expect(response).toBeInstanceOf(Response)
  expect(netFetchMock).toHaveBeenCalledTimes(1)
  const fetchedUrl = netFetchMock.mock.calls[0]?.[0]
  expect(typeof fetchedUrl).toBe('string')
  expect(String(fetchedUrl).startsWith('file://')).toBe(true)
  expect(String(fetchedUrl).endsWith('/index.html')).toBe(true)
})

/**
 * installFaAppProtocolHandler
 * Returns 403 for path traversal attempts that escape the renderer root.
 */
test('Test that installFaAppProtocolHandler refuses traversal outside renderer root', async () => {
  const mod = await import('../registerFaAppProtocol')
  mod.installFaAppProtocolHandler()

  const handler = protocolHandleMock.mock.calls[0]?.[1] as (request: { url: string }) => Promise<Response>
  // Percent-encoded slashes survive URL parsing and become '..' segments only after decodeURIComponent runs, so they reach 'path.join' as real traversal.
  const response = await handler({ url: 'app://./..%2F..%2F..%2Fetc/passwd' })

  expect(response).toBeInstanceOf(Response)
  expect(response.status).toBe(403)
  expect(netFetchMock).not.toHaveBeenCalled()
})

/**
 * installFaAppProtocolHandler
 * Defaults to serving index.html when the URL has no pathname.
 */
test('Test that installFaAppProtocolHandler defaults missing pathname to index.html', async () => {
  const mod = await import('../registerFaAppProtocol')
  mod.installFaAppProtocolHandler()

  const handler = protocolHandleMock.mock.calls[0]?.[1] as (request: { url: string }) => Promise<Response>
  await handler({ url: 'app://./' })

  expect(netFetchMock).toHaveBeenCalledTimes(1)
  expect(String(netFetchMock.mock.calls[0]?.[0]).endsWith('/index.html')).toBe(true)
})

/**
 * setupFaAppProtocol
 * Registers privileges immediately and installs the handler once 'app.whenReady()' resolves.
 */
test('Test that setupFaAppProtocol registers privileges immediately and installs handler after whenReady', async () => {
  const mod = await import('../registerFaAppProtocol')
  mod.setupFaAppProtocol()

  expect(protocolRegisterSchemesAsPrivilegedMock).toHaveBeenCalledTimes(1)
  expect(protocolHandleMock).not.toHaveBeenCalled()

  whenReadyDeferred.resolve()
  await whenReadyDeferred.promise
  await new Promise<void>((resolve) => { setImmediate(resolve) })

  expect(protocolHandleMock).toHaveBeenCalledTimes(1)
})

/**
 * setupFaAppProtocol
 * Logs a single error if the whenReady chain rejects (without throwing out of the bootstrap).
 */
test('Test that setupFaAppProtocol logs an error if whenReady rejects', async () => {
  const failure = new Error('boom')
  appMock.whenReady.mockImplementationOnce(() => Promise.reject(failure))

  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  const mod = await import('../registerFaAppProtocol')
  mod.setupFaAppProtocol()

  await new Promise<void>((resolve) => { setImmediate(resolve) })

  expect(errorSpy).toHaveBeenCalledWith('[faAppProtocol] failed to install app:// handler', failure)
  errorSpy.mockRestore()
})
