import { beforeEach, expect, test, vi } from 'vitest'

import { createFaActionDefinitionHandlersProjectMedia } from '../createFaActionDefinitionHandlersProjectMedia'

const SAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000'

const notifyCreateMock = vi.fn()
const upsertMediaMock = vi.fn(async () => undefined)
const createProjectSwitchCanceledError = (): Error => new Error('project-switch')
let projectEpoch = 1
let projectReplacementInFlight = false
const S_FaActiveProjectMock = vi.fn(() => ({
  hasActiveProject: true,
  isProjectReplacementInFlight: () => projectReplacementInFlight,
  readProjectContentEpoch: () => projectEpoch
}))

const i18n = {
  global: {
    t: (key: string) => key
  }
}

function sampleItems () {
  return [{
    displayName: 'Art',
    externalEmbed: '',
    externalLink: 'https://cdn.example.test/art.png',
    externalType: 'linked' as const,
    id: SAMPLE_UUID,
    internalLink: '',
    internalType: '' as const,
    type: 'external' as const
  }]
}

beforeEach(() => {
  notifyCreateMock.mockClear()
  upsertMediaMock.mockClear()
  projectEpoch = 1
  projectReplacementInFlight = false
  S_FaActiveProjectMock.mockReset()
  S_FaActiveProjectMock.mockReturnValue({
    hasActiveProject: true,
    isProjectReplacementInFlight: () => projectReplacementInFlight,
    readProjectContentEpoch: () => projectEpoch
  })
})

function mediaHandlerDeps () {
  return {
    createProjectSwitchCanceledError,
    i18n,
    notifyCreate: notifyCreateMock,
    S_FaActiveProject: S_FaActiveProjectMock,
    upsertMedia: upsertMediaMock
  }
}

/**
 * handleSaveProjectMedia
 * Rejects when no project is active.
 */
test('Test that handleSaveProjectMedia throws when no project is active', async () => {
  S_FaActiveProjectMock.mockReturnValue({
    hasActiveProject: false,
    isProjectReplacementInFlight: () => projectReplacementInFlight,
    readProjectContentEpoch: () => projectEpoch
  })
  const { handleSaveProjectMedia } = createFaActionDefinitionHandlersProjectMedia(mediaHandlerDeps())
  await expect(handleSaveProjectMedia({ items: sampleItems() })).rejects.toThrow(
    'dialogs.projectMedia.saveError'
  )
  expect(upsertMediaMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * handleSaveProjectMedia
 * Persists items then emits a success toast.
 */
test('Test that handleSaveProjectMedia upserts items and notifies success', async () => {
  const { handleSaveProjectMedia } = createFaActionDefinitionHandlersProjectMedia(mediaHandlerDeps())
  const items = sampleItems()
  await handleSaveProjectMedia({ items })
  expect(upsertMediaMock).toHaveBeenCalledWith(items)
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    message: 'dialogs.projectMedia.saveSuccess',
    type: 'positive'
  })
})

/**
 * handleSaveProjectMedia
 * Persist failure throws and skips the success toast.
 */
test('Test that handleSaveProjectMedia throws when upsert fails', async () => {
  upsertMediaMock.mockRejectedValueOnce(new Error('dialogs.projectMedia.saveError'))
  const { handleSaveProjectMedia } = createFaActionDefinitionHandlersProjectMedia(mediaHandlerDeps())
  await expect(handleSaveProjectMedia({ items: sampleItems() })).rejects.toThrow(
    'dialogs.projectMedia.saveError'
  )
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

test('Test that handleSaveProjectMedia skips the write while a project open is in flight', async () => {
  projectReplacementInFlight = true
  const { handleSaveProjectMedia } = createFaActionDefinitionHandlersProjectMedia(mediaHandlerDeps())
  await expect(handleSaveProjectMedia({ items: sampleItems() })).rejects.toThrow('project-switch')
  expect(upsertMediaMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

test('Test that handleSaveProjectMedia skips the success toast after the project changes', async () => {
  let resolveUpsert: ((value: undefined) => void) | undefined
  upsertMediaMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveUpsert = resolve
    })
  })
  const { handleSaveProjectMedia } = createFaActionDefinitionHandlersProjectMedia(mediaHandlerDeps())
  const pending = handleSaveProjectMedia({ items: sampleItems() })
  await Promise.resolve()
  projectEpoch = 2
  resolveUpsert?.(undefined)
  await expect(pending).rejects.toThrow('project-switch')
  expect(notifyCreateMock).not.toHaveBeenCalled()
})
