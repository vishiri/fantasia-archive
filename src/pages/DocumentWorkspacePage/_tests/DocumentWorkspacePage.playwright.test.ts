import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { patchFaPlaywrightComponentHarnessStores } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessPiniaSeed'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'
/**
 * DocumentWorkspacePage is a route page (not COMPONENT_NAME-mountable). Bootstrap via any
 * components/** SFC, then router.replace to /home/document/:id with openedDocuments seed.
 */
const extraEnvSettings = {
  COMPONENT_NAME: 'ProjectAppControlBar',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components' as const
}

const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

const selectorList = {
  belongsUnderInput: 'documentWorkspacePage-belongsUnderInput',
  backgroundColorInput: 'documentWorkspacePage-backgroundColorInput',
  extraHtmlClassesInput: 'documentWorkspacePage-extraHtmlClassesInput',
  isCategoryToggle: 'documentWorkspacePage-isCategoryToggle',
  isDeadToggle: 'documentWorkspacePage-isDeadToggle',
  isFinishedToggle: 'documentWorkspacePage-isFinishedToggle',
  isMinorToggle: 'documentWorkspacePage-isMinorToggle',
  nameInput: 'documentWorkspacePage-nameInput',
  orderNumberInput: 'documentWorkspacePage-orderNumberInput',
  page: 'documentWorkspacePage',
  previewTitle: 'documentWorkspacePage-previewTitle',
  saveDocumentButton: 'projectAppControlBar-saveDocumentButton',
  saveDocumentKeepEditModeButton: 'projectAppControlBar-saveDocumentKeepEditModeButton',
  tagsInput: 'documentWorkspacePage-tagsInput',
  tagsLabel: 'documentWorkspacePage-tagsLabel',
  textColorInput: 'documentWorkspacePage-textColorInput'
} as const

const DWP_WORLD_ID = '550e8400-e29b-41d4-a716-446655440201'
const DWP_TEMPLATE_ID = '7c9e6679-7425-40de-944b-e07fc1f90c01'

const sampleDocument: I_faProjectDocument = {
  createdAtMs: 1,
  displayName: 'Hero',
  documentBackgroundColor: null,
  documentTextColor: null,
  extraClasses: 'hero-extra',
  id: 'doc-hero',
  isCategory: false,
  isDead: false,
  isFinished: false,
  isMinor: false,
  parentDocumentId: null,
  placementId: null,
  sortOrder: 0,
  templateId: DWP_TEMPLATE_ID,
  treeOrderNumber: Number.MIN_SAFE_INTEGER,
  updatedAtMs: 1,
  worldId: DWP_WORLD_ID
}

const sampleTemplate: I_faProjectDocumentTemplate = {
  createdAtMs: 1,
  displayName: 'Character',
  icon: 'mdi-account',
  id: DWP_TEMPLATE_ID,
  sortOrder: 0,
  titlePluralTranslations: { 'en-US': 'Characters' },
  titleSingularTranslations: { 'en-US': 'Character' },
  updatedAtMs: 1,
  worldAppendix: '',
  worldAppendixTranslations: {}
}

const sampleWorld: I_faProjectWorld = {
  color: '#4caf50',
  colorPalette: '',
  createdAtMs: 1,
  displayName: 'Eldoria',
  displayNameTranslations: { 'en-US': 'Eldoria' },
  id: DWP_WORLD_ID,
  sortOrder: 0,
  updatedAtMs: 1
}

const documentContentOverrides = {
  documentsById: {
    [sampleDocument.id]: sampleDocument
  },
  templatesById: {
    [DWP_TEMPLATE_ID]: sampleTemplate
  },
  worldsById: {
    [DWP_WORLD_ID]: sampleWorld
  }
} as const

const sampleTabBase = {
  documentId: 'doc-hero',
  persistenceState: 'persisted' as const,
  tabLabel: 'Character',
  templateIcon: 'mdi-account',
  displayNameDraft: 'Hero',
  savedDisplayName: 'Hero',
  documentTextColorDraft: '',
  savedDocumentTextColor: '',
  documentBackgroundColorDraft: '',
  savedDocumentBackgroundColor: '',
  isCategoryDraft: false,
  savedIsCategory: false,
  isFinishedDraft: false,
  isMinorDraft: false,
  isDeadDraft: false,
  savedIsFinished: false,
  savedIsMinor: false,
  savedIsDead: false,
  parentDocumentIdDraft: '',
  savedParentDocumentId: '',
  treeOrderNumberDraft: '',
  savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  extraClassesDraft: 'hero-extra',
  savedExtraClasses: 'hero-extra',
  hasUnsavedChanges: false,
  worldId: DWP_WORLD_ID
}

function buildTab (
  editState: boolean,
  overrides: Partial<I_faOpenedDocumentTab> = {}
): I_faOpenedDocumentTab {
  return {
    ...sampleTabBase,
    editState,
    ...overrides
  }
}

async function openDocumentWorkspacePage (
  page: Page,
  editState: boolean,
  overrides: Partial<I_faOpenedDocumentTab> = {},
  seedExtras: Pick<I_faComponentTestingStoreSeed, 'projectContentOverrides'> = {}
): Promise<void> {
  const seed: I_faComponentTestingStoreSeed = {
    openedDocuments: {
      activeDocumentId: 'doc-hero',
      tabs: [buildTab(editState, overrides)]
    },
    ...seedExtras
  }
  await page.waitForFunction(() => {
    return typeof window.__faComponentTestingPatchStores === 'function'
  }, { timeout: 30_000 })
  await page.evaluate(async (documentId) => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $router: {
              replace: (location: { path: string }) => Promise<void>
            }
          }
        }
      }
    }
    const router = root?.__vue_app__?.config.globalProperties.$router
    if (router === undefined) {
      throw new Error('Vue router missing in component harness')
    }
    await router.replace({ path: `/home/document/${documentId}` })
  }, 'doc-hero')
  await page.waitForTimeout(faFrontendRenderTimer)
  await patchFaPlaywrightComponentHarnessStores(page, seed)
  await page.waitForTimeout(faFrontendRenderTimer)
}

async function readOpenedDocumentsSession (page: Page): Promise<{
  activeDocumentId: string | null
  tabs: Array<{
    displayNameDraft: string
    documentId: string
    documentBackgroundColorDraft: string
    documentTextColorDraft: string
    editState: boolean
    extraClassesDraft: string
    hasUnsavedChanges: boolean
    isDeadDraft: boolean
    isFinishedDraft: boolean
    isMinorDraft: boolean
    parentDocumentIdDraft: string
    treeOrderNumberDraft: string
  }>
}> {
  return page.evaluate(() => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                activeDocumentId?: string | null
                tabs?: Array<{
                  displayNameDraft: string
                  documentId: string
                  documentBackgroundColorDraft: string
                  documentTextColorDraft: string
                  editState: boolean
                  extraClassesDraft: string
                  hasUnsavedChanges: boolean
                  isDeadDraft: boolean
                  isFinishedDraft: boolean
                  isMinorDraft: boolean
                  parentDocumentIdDraft: string
                  treeOrderNumberDraft: string
                }>
              }>
            }
          }
        }
      }
    }
    const store = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaOpenedDocuments')
    if (store === undefined) {
      throw new Error('S_FaOpenedDocuments missing in component harness')
    }
    return {
      activeDocumentId: store.activeDocumentId ?? null,
      tabs: [...(store.tabs ?? [])].map((tab) => {
        return {
          displayNameDraft: tab.displayNameDraft,
          documentId: tab.documentId,
          documentBackgroundColorDraft: tab.documentBackgroundColorDraft,
          documentTextColorDraft: tab.documentTextColorDraft,
          editState: tab.editState,
          extraClassesDraft: tab.extraClassesDraft,
          hasUnsavedChanges: tab.hasUnsavedChanges,
          isDeadDraft: tab.isDeadDraft,
          isFinishedDraft: tab.isFinishedDraft,
          isMinorDraft: tab.isMinorDraft,
          parentDocumentIdDraft: tab.parentDocumentIdDraft,
          treeOrderNumberDraft: tab.treeOrderNumberDraft
        }
      })
    }
  })
}

test.describe.serial('Document workspace page preview vs edit', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightComponentHarnessWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          COMPONENT_NAME: extraEnvSettings.COMPONENT_NAME,
          COMPONENT_PROPS: extraEnvSettings.COMPONENT_PROPS,
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      renderDelayMs: faFrontendRenderTimer,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Check if preview mode shows the preview title and hides the name input', async () => {
    await openDocumentWorkspacePage(appWindow, false)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.page}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.previewTitle}"]`)
    ).toHaveText('Hero')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)
    ).toHaveCount(0)
  })

  test('Check if preview mode keeps status toggles and belongs-under read-only', async () => {
    await openDocumentWorkspacePage(appWindow, false)

    const categoryToggle = appWindow.locator(
      `[data-test-locator="${selectorList.isCategoryToggle}"]`
    )
    await expect(categoryToggle).toBeVisible()
    await expect(
      categoryToggle.locator('.q-toggle')
    ).toHaveAttribute('aria-disabled', 'true')

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.isFinishedToggle}"] .q-toggle`)
    ).toHaveAttribute('aria-disabled', 'true')

    const belongsUnder = appWindow.locator(
      `[data-test-locator="${selectorList.belongsUnderInput}"]`
    )
    await expect(belongsUnder).toBeVisible()
    await expect(belongsUnder).toBeDisabled()

    const orderNumber = appWindow.locator(
      `[data-test-locator="${selectorList.orderNumberInput}"]`
    )
    await expect(orderNumber).toBeVisible()
    await expect(orderNumber).toBeDisabled()
  })

  test('Check if edit mode shows the name input and hides the preview title', async () => {
    await openDocumentWorkspacePage(appWindow, true)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.previewTitle}"]`)
    ).toHaveCount(0)
    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)
    await expect(nameInput).toBeVisible()
    await expect(nameInput).toHaveValue('Hero')
  })

  test('Check if edit mode enables name and belongs-under inputs', async () => {
    await openDocumentWorkspacePage(appWindow, true)

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)
    await expect(nameInput).toBeEnabled()
    await nameInput.fill('Hero renamed')
    await expect(nameInput).toHaveValue('Hero renamed')

    const belongsUnder = appWindow.locator(
      `[data-test-locator="${selectorList.belongsUnderInput}"]`
    )
    await expect(belongsUnder).toBeEnabled()

    const extraClasses = appWindow.locator(
      `[data-test-locator="${selectorList.extraHtmlClassesInput}"]`
    )
    await expect(extraClasses).toBeEnabled()
    await expect(extraClasses).toHaveValue('hero-extra')
  })

  test('Check if extra HTML classes from the tab draft appear on the page root', async () => {
    await openDocumentWorkspacePage(appWindow, false)

    const pageRoot = appWindow.locator(`[data-test-locator="${selectorList.page}"]`)
    await expect(pageRoot).toHaveClass(/hero-extra/)
  })

  test('Check if name edit updates the tab label and marks the tab unsaved', async () => {
    await openDocumentWorkspacePage(appWindow, true)

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)
    await nameInput.fill('Hero renamed')
    await expect(nameInput).toHaveValue('Hero renamed')

    const tab = appWindow.locator('[data-test-locator="projectAppControlBar-tab-doc-hero"]')
    await expect(tab.getByText('Hero renamed', { exact: true })).toHaveCount(1)
    await expect(tab).toHaveClass(/projectAppControlBarTabs__tab--withUnsavedAlert/)
  })

  test('Check if preview mode keeps color pickers read-only', async () => {
    await openDocumentWorkspacePage(appWindow, false)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.textColorInput}"]`)
    ).toHaveAttribute('readonly')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.backgroundColorInput}"]`)
    ).toHaveAttribute('readonly')
  })

  test('Check if finished dead and minor toggles update tab markers', async () => {
    await openDocumentWorkspacePage(appWindow, true)

    await appWindow
      .locator(`[data-test-locator="${selectorList.isFinishedToggle}-toggle"]`)
      .click()
    await appWindow
      .locator(`[data-test-locator="${selectorList.isDeadToggle}-toggle"]`)
      .click()
    await appWindow
      .locator(`[data-test-locator="${selectorList.isMinorToggle}-toggle"]`)
      .click()

    const tab = appWindow.locator('[data-test-locator="projectAppControlBar-tab-doc-hero"]')
    await expect(tab.locator('.projectAppControlBarTabs__finishedMarker')).toHaveText('✓')
    await expect(tab.locator('.projectAppControlBarTabs__deadMarker')).toHaveText('†')
    await expect(tab).toHaveClass(/projectAppControlBarTabs__tab--dead/)

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      const hero = session.tabs.find((row) => row.documentId === 'doc-hero')
      return hero === undefined
        ? null
        : {
            finished: hero.isFinishedDraft,
            dead: hero.isDeadDraft,
            minor: hero.isMinorDraft,
            unsaved: hero.hasUnsavedChanges
          }
    }).toEqual({
      finished: true,
      dead: true,
      minor: true,
      unsaved: true
    })
  })

  test('Check if text and background color edits update tab chrome', async () => {
    await openDocumentWorkspacePage(appWindow, true)

    await appWindow
      .locator(`[data-test-locator="${selectorList.textColorInput}"]`)
      .fill('#aabbcc')
    await appWindow
      .locator(`[data-test-locator="${selectorList.backgroundColorInput}"]`)
      .fill('#112233')

    const tab = appWindow.locator('[data-test-locator="projectAppControlBar-tab-doc-hero"]')
    await expect(tab).toHaveClass(/projectAppControlBarTabs__tab--customAppearance/)
    await expect(tab).toHaveClass(/projectAppControlBarTabs__tab--customDocumentBackground/)
    await expect(tab).toHaveAttribute('style', /#aabbcc/i)
    await expect(tab).toHaveAttribute('style', /#112233/i)
    await expect(tab).toHaveClass(/projectAppControlBarTabs__tab--withUnsavedAlert/)
  })

  test('Check if belongs-under edit updates parent draft and marks unsaved', async () => {
    await openDocumentWorkspacePage(appWindow, true)

    const belongsUnder = appWindow.locator(
      `[data-test-locator="${selectorList.belongsUnderInput}"]`
    )
    await belongsUnder.fill('doc-parent-xyz')
    await expect(belongsUnder).toHaveValue('doc-parent-xyz')

    const tab = appWindow.locator('[data-test-locator="projectAppControlBar-tab-doc-hero"]')
    await expect(tab).toHaveClass(/projectAppControlBarTabs__tab--withUnsavedAlert/)

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      const hero = session.tabs.find((row) => row.documentId === 'doc-hero')
      return hero === undefined
        ? null
        : {
            parent: hero.parentDocumentIdDraft,
            unsaved: hero.hasUnsavedChanges
          }
    }).toEqual({
      parent: 'doc-parent-xyz',
      unsaved: true
    })
  })

  test('Check if empty extra HTML classes leave no extra class tokens on the page root', async () => {
    await openDocumentWorkspacePage(appWindow, false, {
      extraClassesDraft: '',
      savedExtraClasses: ''
    })

    const pageRoot = appWindow.locator(`[data-test-locator="${selectorList.page}"]`)
    await expect(pageRoot).not.toHaveClass(/hero-extra/)
    const className = await pageRoot.getAttribute('class')
    expect(className ?? '').not.toMatch(/\bhero-extra\b/)
  })

  test('Check if edit mode makes status colors order and extra HTML fields writable', async () => {
    await openDocumentWorkspacePage(appWindow, true)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.textColorInput}"]`)
    ).not.toHaveAttribute('readonly')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.backgroundColorInput}"]`)
    ).not.toHaveAttribute('readonly')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.isFinishedToggle}-toggle"]`)
    ).not.toHaveAttribute('aria-disabled', 'true')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.orderNumberInput}"]`)
    ).toBeEnabled()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.extraHtmlClassesInput}"]`)
    ).toBeEnabled()

    await appWindow
      .locator(`[data-test-locator="${selectorList.orderNumberInput}"]`)
      .fill('42')
    await appWindow
      .locator(`[data-test-locator="${selectorList.extraHtmlClassesInput}"]`)
      .fill('hero-extra renamed-extra')

    const pageRoot = appWindow.locator(`[data-test-locator="${selectorList.page}"]`)
    await expect(pageRoot).toHaveClass(/renamed-extra/)

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      const hero = session.tabs.find((row) => row.documentId === 'doc-hero')
      return hero === undefined
        ? null
        : {
            order: hero.treeOrderNumberDraft,
            extra: hero.extraClassesDraft,
            unsaved: hero.hasUnsavedChanges
          }
    }).toEqual({
      order: '42',
      extra: 'hero-extra renamed-extra',
      unsaved: true
    })
  })

  test('Check if Save from the strip persists drafts and returns to preview', async () => {
    await openDocumentWorkspacePage(appWindow, true, {}, {
      projectContentOverrides: {
        documentsById: documentContentOverrides.documentsById,
        templatesById: documentContentOverrides.templatesById,
        worldsById: documentContentOverrides.worldsById
      }
    })

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)
    await nameInput.fill('Hero Saved')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.saveDocumentButton}"]`)
    ).toBeVisible()

    await appWindow
      .locator(`[data-test-locator="${selectorList.saveDocumentButton}"]`)
      .click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      const hero = session.tabs.find((row) => row.documentId === 'doc-hero')
      return hero === undefined
        ? null
        : {
            displayName: hero.displayNameDraft,
            editState: hero.editState,
            unsaved: hero.hasUnsavedChanges
          }
    }, {
      timeout: 15_000
    }).toEqual({
      displayName: 'Hero Saved',
      editState: false,
      unsaved: false
    })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.previewTitle}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.previewTitle}"]`)
    ).toContainText('Hero Saved')
  })

  test('Check if Save keep-edit persists drafts while staying in edit mode', async () => {
    await openDocumentWorkspacePage(appWindow, true, {}, {
      projectContentOverrides: {
        documentsById: documentContentOverrides.documentsById,
        templatesById: documentContentOverrides.templatesById,
        worldsById: documentContentOverrides.worldsById
      }
    })

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)
    await nameInput.fill('Hero Keep Edit')
    await appWindow
      .locator(`[data-test-locator="${selectorList.saveDocumentKeepEditModeButton}"]`)
      .click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      const hero = session.tabs.find((row) => row.documentId === 'doc-hero')
      return hero === undefined
        ? null
        : {
            displayName: hero.displayNameDraft,
            editState: hero.editState,
            unsaved: hero.hasUnsavedChanges
          }
    }, {
      timeout: 15_000
    }).toEqual({
      displayName: 'Hero Keep Edit',
      editState: true,
      unsaved: false
    })
    await expect(nameInput).toBeVisible()
    await expect(nameInput).toHaveValue('Hero Keep Edit')
    await expect(
      appWindow.locator('[data-test-locator="projectAppControlBar-tab-doc-hero"]')
    ).not.toHaveClass(/projectAppControlBarTabs__tab--withUnsavedAlert/)
  })
})

test.describe.serial('Document workspace page Tags field', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 120_000
  })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightComponentHarnessWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          COMPONENT_NAME: extraEnvSettings.COMPONENT_NAME,
          COMPONENT_PROPS: extraEnvSettings.COMPONENT_PROPS,
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      renderDelayMs: faFrontendRenderTimer,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Check if preview mode shows Tags label with disabled tags input', async () => {
    await openDocumentWorkspacePage(appWindow, false, {
      savedTags: [{
        id: 'tag-places',
        name: 'Places'
      }],
      tagsDraft: [{
        id: 'tag-places',
        name: 'Places'
      }]
    })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tagsLabel}"]`)
    ).toBeVisible()
    const tagsInput = appWindow.locator(`[data-test-locator="${selectorList.tagsInput}"]`)
    await expect(tagsInput).toBeVisible()
    // Quasar puts data-test-locator on the native input; disable → HTML disabled (not aria-disabled).
    await expect(tagsInput).toBeDisabled()
  })

  test('Check if edit mode shows seeded Tags chips and world tag options', async () => {
    await openDocumentWorkspacePage(appWindow, true, {
      savedTags: [{
        id: 'tag-places',
        name: 'Places'
      }],
      tagsDraft: [{
        id: 'tag-places',
        name: 'Places'
      }]
    }, {
      projectContentOverrides: {
        documentsById: documentContentOverrides.documentsById,
        tagsByWorldId: {
          [DWP_WORLD_ID]: [{
            createdAtMs: 1,
            id: 'tag-places',
            name: 'Places',
            updatedAtMs: 1,
            worldId: DWP_WORLD_ID
          }, {
            createdAtMs: 1,
            id: 'tag-people',
            name: 'People',
            updatedAtMs: 1,
            worldId: DWP_WORLD_ID
          }]
        },
        templatesById: documentContentOverrides.templatesById,
        worldsById: documentContentOverrides.worldsById
      }
    })

    const tagsInput = appWindow.locator(`[data-test-locator="${selectorList.tagsInput}"]`)
    await expect(tagsInput).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tagsInput}-chip"]`).filter({ hasText: 'Places' })
    ).toBeVisible()

    await tagsInput.click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tagsInput}-option-0"]`)
    ).toBeVisible({ timeout: 15_000 })
  })
})
