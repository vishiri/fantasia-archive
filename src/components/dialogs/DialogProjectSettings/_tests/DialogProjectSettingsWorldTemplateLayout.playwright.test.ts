import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { dragWorldTemplateLayoutTreeNode } from 'app/helpers/playwrightHelpers_component/dialogProjectSettingsWorldTemplateLayoutTreeDrag'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_projectSettings from 'app/i18n/en-US/dialogs/L_projectSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

const extraEnvSettings = {
  COMPONENT_NAME: 'DialogProjectSettings',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components'
}

const faFrontendRenderTimer = FA_FRONTEND_RENDER_TIMER
const projectSettingsDirectInput: T_dialogName = 'ProjectSettings'

const fixtureWorldId = '550e8400-e29b-41d4-a716-446655440000'
const fixtureTemplateAId = '660e8400-e29b-41d4-a716-446655440001'
const fixtureTemplateBId = '660e8400-e29b-41d4-a716-446655440002'
const fixturePlacementAId = '880e8400-e29b-41d4-a716-446655440001'
const fixturePlacementBId = '880e8400-e29b-41d4-a716-446655440002'
const fixtureGroupId = '770e8400-e29b-41d4-a716-446655440001'
const fixtureGroupBId = '770e8400-e29b-41d4-a716-446655440002'

const selectorList = {
  documentTemplatesNameInput: 'dialogProjectSettings-documentTemplates-nameInput',
  groupContextMenu: 'dialogProjectSettings-worldTemplateLayoutGroupContextMenu',
  groupRenameInput: 'dialogProjectSettings-worldTemplateLayoutGroupRenameInput',
  saveButton: 'dialogProjectSettings-button-save',
  saveErrorsIcon: 'dialogProjectSettings-saveErrorsIcon',
  tabDocumentTemplatesSettings: 'dialogProjectSettings-tab-documentTemplatesSettings',
  tabWorldsSettings: 'dialogProjectSettings-tab-worldsSettings',
  templateCanonicalName: 'dialogProjectSettings-worldTemplateLayoutTemplateCanonicalName',
  templateContextMenu: 'dialogProjectSettings-worldTemplateLayoutTemplateContextMenu',
  templateRenameInput: 'dialogProjectSettings-worldTemplateLayoutTemplateRenameInput',
  worldTemplateLayoutAddGroup: 'dialogProjectSettings-worldTemplateLayoutAddGroup',
  worldTemplateLayoutTree: 'dialogProjectSettings-worldTemplateLayoutTree',
  worldAvailableTemplatesTitle: 'dialogProjectSettings-worldAvailableTemplatesTitle',
  worldsTab: 'dialogProjectSettings-worlds-tab'
} as const

function treeNodeLocator (kind: 'group' | 'template', nodeId: string): string {
  return `[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-${kind}-${nodeId}"]`
}

function treeNodeShellLocator (kind: 'group' | 'template', nodeId: string): string {
  return `.dialogProjectSettingsWorldTemplateLayoutTree .tree-node:has(${treeNodeLocator(kind, nodeId)})`
}

function treeGroupRowLocator (): string {
  return '[data-test-locator^="dialogProjectSettings-worldTemplateLayoutTreeNode-group-"]:not([data-test-locator$="-remove"]):not([data-test-locator$="-edit"])'
}

function treeTemplateRowLocator (): string {
  return '[data-test-locator^="dialogProjectSettings-worldTemplateLayoutTreeNode-template-"]:not([data-test-locator$="-remove"]):not([data-test-locator$="-edit"]):not([data-test-locator$="-count"])'
}

function buildLayoutHarnessProps (templateLayout: Record<string, unknown>): string {
  return JSON.stringify({
    directDocumentTemplatesSnapshot: [
      {
        documentCount: 0,
        icon: 'mdi-account',
        id: fixtureTemplateAId,
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
        worldAppendixTranslations: {}
      },
      {
        documentCount: 0,
        icon: 'mdi-map',
        id: fixtureTemplateBId,
        titlePluralTranslations: { 'en-US': 'Location' },
        titleSingularTranslations: {},
        worldAppendixTranslations: {}
      }
    ],
    directInput: projectSettingsDirectInput,
    directSettingsSnapshot: {
      projectName: 'Layout harness project',
      schemaVersion: 1
    },
    directWorldsSnapshot: [{
      color: '',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Layout harness world' },
      documentCount: 0,
      id: fixtureWorldId,
      templateLayout
    }]
  })
}

const rootTemplatesLayout = {
  groups: [],
  placements: [
    {
      documentCountInWorld: 0,
      documentTemplateId: fixtureTemplateAId,
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: fixturePlacementAId,
      nickname: '',
      rootSortOrder: 0,
      templateDisplayName: 'Character',
      worldAppendix: ''
    },
    {
      documentCountInWorld: 0,
      documentTemplateId: fixtureTemplateBId,
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-map',
      id: fixturePlacementBId,
      nickname: '',
      rootSortOrder: 1,
      templateDisplayName: 'Location',
      worldAppendix: ''
    }
  ]
}

const nestedTemplatesLayout = {
  groups: [{
    displayName: 'Creatures',
    id: fixtureGroupId,
    rootSortOrder: 0
  }],
  placements: [
    {
      documentCountInWorld: 0,
      documentTemplateId: fixtureTemplateAId,
      groupId: fixtureGroupId,
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: fixturePlacementAId,
      nickname: '',
      rootSortOrder: null,
      templateDisplayName: 'Character',
      worldAppendix: ''
    },
    {
      documentCountInWorld: 0,
      documentTemplateId: fixtureTemplateBId,
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-map',
      id: fixturePlacementBId,
      nickname: '',
      rootSortOrder: 1,
      templateDisplayName: 'Location',
      worldAppendix: ''
    }
  ]
}

const twoGroupsTemplatesLayout = {
  groups: [
    {
      displayName: 'Creatures',
      id: fixtureGroupId,
      rootSortOrder: 0
    },
    {
      displayName: 'Places',
      id: fixtureGroupBId,
      rootSortOrder: 1
    }
  ],
  placements: nestedTemplatesLayout.placements
}

async function readTreeNodePaddingLeftPx (
  page: Page,
  shellLocator: string
): Promise<number> {
  return page.locator(shellLocator).first().evaluate((element) => {
    const treeNode = element.closest('.tree-node')
    if (treeNode === null) {
      return 0
    }
    return Number.parseFloat(window.getComputedStyle(treeNode).paddingLeft) || 0
  })
}

async function expectTemplateNestedUnderGroup (
  page: Page,
  groupId: string,
  placementId: string
): Promise<void> {
  const groupShell = treeNodeShellLocator('group', groupId)
  const templateShell = treeNodeShellLocator('template', placementId)
  await expect(page.locator(templateShell)).toHaveCount(1)
  const groupPad = await readTreeNodePaddingLeftPx(page, groupShell)
  const templatePad = await readTreeNodePaddingLeftPx(page, templateShell)
  expect(templatePad).toBeGreaterThan(groupPad)
  const rowTexts = await page.locator(
    '.dialogProjectSettingsWorldTemplateLayoutTree .tree-node'
  ).allTextContents()
  const groupIndex = rowTexts.findIndex((text) => text.includes('Creatures'))
  const templateIndex = rowTexts.findIndex((text) => text.includes('Character'))
  expect(groupIndex).toBeGreaterThanOrEqual(0)
  expect(templateIndex).toBeGreaterThan(groupIndex)
}

test.describe.serial('Project settings world template layout nested regression', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = buildLayoutHarnessProps(nestedTemplatesLayout)
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

  /**
   * Regression repro: repeated Add group keeps a nested template under its group in the tree.
   */
  test('Keeps nested template after repeated Add group clicks', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldTemplateLayoutTree}"]`)
    ).toBeVisible()
    await expectTemplateNestedUnderGroup(
      appWindow,
      fixtureGroupId,
      fixturePlacementAId
    )
    const addGroup = appWindow.locator(`[data-test-locator="${selectorList.worldTemplateLayoutAddGroup}"]`)
    await addGroup.click()
    await addGroup.click()
    await addGroup.click()
    await expectTemplateNestedUnderGroup(
      appWindow,
      fixtureGroupId,
      fixturePlacementAId
    )
    await expect(appWindow.locator(treeGroupRowLocator())).toHaveCount(4)
    await expect(appWindow.locator(treeTemplateRowLocator())).toHaveCount(2)
  })
})

test.describe.serial('Project settings world template layout drag reorder', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = buildLayoutHarnessProps(rootTemplatesLayout)
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

  /**
   * Root reorder swaps two root template rows after drag.
   */
  test('Reorders root templates via drag', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldTemplateLayoutTree}"]`)
    ).toBeVisible()
    const firstTemplate = appWindow.locator(treeNodeLocator('template', fixturePlacementAId))
    const secondTemplate = appWindow.locator(treeNodeLocator('template', fixturePlacementBId))
    await dragWorldTemplateLayoutTreeNode(
      appWindow,
      treeNodeShellLocator('template', fixturePlacementBId),
      treeNodeShellLocator('template', fixturePlacementAId),
      'insert-before-target'
    )
    await expect(async () => {
      const order = await appWindow.locator(treeTemplateRowLocator()).allTextContents()
      expect(order[0]).toContain('Location')
      expect(order[1]).toContain('Character')
    }).toPass({ timeout: 5000 })
    await expect(firstTemplate).toBeVisible()
    await expect(secondTemplate).toBeVisible()
  })
})

test.describe.serial('Project settings duplicate template layout validation', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = buildLayoutHarnessProps({
      groups: [],
      placements: [
        {
          documentCountInWorld: 0,
          documentTemplateId: fixtureTemplateAId,
          groupId: null,
          groupSortOrder: null,
          icon: 'mdi-account',
          id: fixturePlacementAId,
          nickname: '',
          rootSortOrder: 0,
          templateDisplayName: 'Character',
          worldAppendixTranslations: {}
        },
        {
          documentCountInWorld: 0,
          documentTemplateId: fixtureTemplateAId,
          groupId: null,
          groupSortOrder: null,
          icon: 'mdi-account',
          id: fixturePlacementBId,
          nickname: '',
          rootSortOrder: 1,
          templateDisplayName: 'Character copy',
          worldAppendixTranslations: {}
        }
      ]
    })
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

  /**
   * Duplicate template placements block save and surface negative chrome.
   */
  test('Duplicate template placements disable save and highlight validation errors', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const saveButton = appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    await expect(saveButton).toBeDisabled()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.saveErrorsIcon}"]`)
    ).toHaveCount(1)
    const duplicateRows = appWindow.locator('[data-test-validation-error="true"][data-test-locator^="dialogProjectSettings-worldTemplateLayoutTreeNode-template-"]')
    await expect(duplicateRows).toHaveCount(2)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldsTab}"]`)
    ).toHaveAttribute('data-test-validation-error', 'true')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`)
    ).toHaveAttribute('data-test-validation-error', 'true')
    const bulletLine = L_projectSettings.saveErrors.bulletWorldTemplateDuplicateDocumentTemplate
      .replace('{worldLabel}', 'Layout harness world')
      .replace('{templateLabel}', 'Character')
    const expectedTooltip = `${L_projectSettings.saveErrors.tooltipIntro}\n- ${bulletLine}`
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.saveErrorsIcon}"]`)
    ).toHaveAttribute('data-test-tooltip-text', expectedTooltip)
  })
})

test.describe.serial('Project settings blank template group name validation', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = buildLayoutHarnessProps(nestedTemplatesLayout)
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

  /**
   * Clearing a group name via the inline rename menu blocks save and highlights tabs.
   */
  test('Blank group name from inline rename disables save and highlights validation errors', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const groupRow = appWindow.locator(treeNodeLocator('group', fixtureGroupId))
    await groupRow.click({ button: 'right' })
    const renameInput = appWindow.locator(`[data-test-locator="${selectorList.groupRenameInput}"]`)
    await expect(renameInput).toBeVisible()
    await renameInput.pressSequentially('ABC', { delay: 50 })
    await expect(renameInput).toBeVisible()
    await expect(renameInput).toHaveValue(/ABC/)
    await renameInput.fill('')
    await expect(groupRow).toHaveAttribute('data-test-validation-error', 'true')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    ).toBeDisabled()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldsTab}"]`)
    ).toHaveAttribute('data-test-validation-error', 'true')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`)
    ).toHaveAttribute('data-test-validation-error', 'true')
    const bulletLine = L_projectSettings.saveErrors.bulletWorldTemplateGroupNameRequired
      .replace('{worldLabel}', 'Layout harness world')
    const expectedTooltip = `${L_projectSettings.saveErrors.tooltipIntro}\n- ${bulletLine}`
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.saveErrorsIcon}"]`)
    ).toHaveAttribute('data-test-tooltip-text', expectedTooltip)
  })
})

test.describe.serial('Project settings group rename menu dismiss', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = buildLayoutHarnessProps(twoGroupsTemplatesLayout)
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

  /**
   * Edit button opens the inline group rename menu.
   */
  test('Edit button opens the group rename menu', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const groupRow = appWindow.locator(treeNodeLocator('group', fixtureGroupId))
    const renameInput = appWindow.locator(`[data-test-locator="${selectorList.groupRenameInput}"]`)
    await groupRow.locator('[data-test-locator$="-edit"]').click()
    await expect(renameInput).toBeVisible()
  })

  /**
   * Escape, Enter, and outside click close the inline group rename menu.
   */
  test('Escape Enter and outside click close the group rename menu', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const groupRow = appWindow.locator(treeNodeLocator('group', fixtureGroupId))
    const renameInput = appWindow.locator(`[data-test-locator="${selectorList.groupRenameInput}"]`)
    await groupRow.click({ button: 'right' })
    await expect(renameInput).toBeVisible()
    await renameInput.press('Escape')
    await expect(renameInput).toHaveCount(0)
    await groupRow.click({ button: 'right' })
    await expect(renameInput).toBeVisible()
    await renameInput.press('Enter')
    await expect(renameInput).toHaveCount(0)
    await groupRow.click({ button: 'right' })
    await expect(renameInput).toBeVisible()
    await appWindow.locator(`[data-test-locator="${selectorList.worldAvailableTemplatesTitle}"]`).click()
    await expect(renameInput).toHaveCount(0)
  })

  /**
   * Opening a second group rename menu closes the first menu.
   */
  test('Only one group rename menu stays open at a time', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const firstGroupRow = appWindow.locator(treeNodeLocator('group', fixtureGroupId))
    const secondGroupRow = appWindow.locator(treeNodeLocator('group', fixtureGroupBId))
    const renameInput = appWindow.locator(`[data-test-locator="${selectorList.groupRenameInput}"]`)
    await firstGroupRow.click({ button: 'right' })
    await expect(renameInput).toHaveCount(1)
    await secondGroupRow.click({ button: 'right' })
    await expect(renameInput).toHaveCount(1)
    await expect(renameInput).toBeVisible()
  })
})

test.describe.serial('Project settings template inline rename sync', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = buildLayoutHarnessProps(rootTemplatesLayout)
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

  /**
   * Edit button opens the inline template rename menu.
   */
  test('Edit button opens the template rename menu', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const templateRow = appWindow.locator(treeNodeLocator('template', fixturePlacementAId))
    const renameInput = appWindow.locator(`[data-test-locator="${selectorList.templateRenameInput}"]`)
    await templateRow.locator('[data-test-locator$="-edit"]').click()
    await expect(renameInput).toBeVisible()
  })

  /**
   * Clearing a placement nickname from the layout tree does not block save.
   */
  test('Blank placement nickname from inline rename does not block save', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const templateRow = appWindow.locator(treeNodeLocator('template', fixturePlacementAId))
    await templateRow.click({ button: 'right' })
    const renameInput = appWindow.locator(`[data-test-locator="${selectorList.templateRenameInput}"]`)
    await expect(renameInput).toBeVisible()
    await renameInput.fill('Hero')
    await renameInput.fill('')
    await expect(templateRow).not.toHaveAttribute('data-test-validation-error', 'true')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    ).toBeEnabled()
  })

  /**
   * Setting a placement nickname updates the layout tree without changing Document Templates settings.
   */
  test('Layout tree placement nickname does not change Document Templates settings name', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const templateRow = appWindow.locator(treeNodeLocator('template', fixturePlacementAId))
    await templateRow.click({ button: 'right' })
    const renameInput = appWindow.locator(`[data-test-locator="${selectorList.templateRenameInput}"]`)
    await expect(renameInput).toBeVisible()
    await renameInput.fill('Hero')
    await renameInput.press('Enter')
    await expect(templateRow).toContainText('Hero')
    await templateRow.locator('[data-test-locator$="-edit"]').click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.templateCanonicalName}"] input`)
    ).toHaveValue('Character')
    await renameInput.press('Escape')
    await appWindow.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesNameInput}"]`)
    ).toHaveValue('Character')
  })

  /**
   * Renaming a template from Document Templates settings updates the layout tree when no nickname is set.
   */
  test('Document Templates settings rename syncs to layout tree when placement nickname is empty', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const templateRow = appWindow.locator(treeNodeLocator('template', fixturePlacementAId))
    await templateRow.click({ button: 'right' })
    const renameInput = appWindow.locator(`[data-test-locator="${selectorList.templateRenameInput}"]`)
    await expect(renameInput).toBeVisible()
    await renameInput.fill('')
    await renameInput.press('Enter')
    await appWindow.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`).click()
    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesNameInput}"]`)
    await nameInput.fill('Protagonist')
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    await expect(templateRow).toContainText('Protagonist')
  })
})
