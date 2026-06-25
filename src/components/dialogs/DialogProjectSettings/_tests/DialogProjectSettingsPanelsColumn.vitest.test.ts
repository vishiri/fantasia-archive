import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsPanelsColumn from '../DialogProjectSettingsPanelsColumn.vue'
import {
  FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB,
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB
} from '../scripts/functions/dialogProjectSettingsDialogInput'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'
import { dialogProjectSettingsWorldDraftFixture } from './dialogProjectSettingsWorldDraftFixtures'

/**
 * DialogProjectSettingsPanelsColumn
 * Forwards project name updates from the general settings panel.
 */
test('Test that DialogProjectSettingsPanelsColumn forwards project name updates', async () => {
  const w = mount(DialogProjectSettingsPanelsColumn, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: null,
      projectName: 'Panel name',
      projectNameHasError: false,
      selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
      worlds: null
    },
    global: {
      stubs: {
        DialogProjectSettingsGeneralPanel: {
          props: ['projectName'],
          emits: ['update:projectName'],
          template: '<button type="button" @click="$emit(\'update:projectName\', \'Updated\')" />'
        },
        DialogProjectSettingsDocumentTemplatesPanel: true,
        DialogProjectSettingsWorldsPanel: true,
        QSeparator: { template: '<hr />' },
        QTabPanel: { template: '<div><slot /></div>' },
        QTabPanels: { template: '<div><slot /></div>' }
      }
    }
  })

  await w.find('button').trigger('click')

  expect(w.emitted('update:projectName')?.[0]).toEqual(['Updated'])
})

/**
 * DialogProjectSettingsPanelsColumn
 * Renders the worlds settings panel when the worlds tab is selected.
 */
test('Test that DialogProjectSettingsPanelsColumn renders the worlds settings panel', () => {
  const w = mount(DialogProjectSettingsPanelsColumn, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      projectName: 'Panel name',
      projectNameHasError: false,
      selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB,
      worlds: []
    },
    global: {
      stubs: {
        DialogProjectSettingsGeneralPanel: true,
        DialogProjectSettingsDocumentTemplatesPanel: true,
        DialogProjectSettingsWorldsPanel: {
          template: '<div data-test-locator="dialogProjectSettings-worlds-panel-stub" />'
        },
        QSeparator: { template: '<hr />' },
        QTabPanel: { template: '<div><slot /></div>' },
        QTabPanels: { template: '<div><slot /></div>' }
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-panel-stub"]').exists()).toBe(true)
})

/**
 * DialogProjectSettingsPanelsColumn
 * Forwards worlds panel world-draft and color updates to parent emits.
 */
test('Test that DialogProjectSettingsPanelsColumn forwards worlds panel updates', async () => {
  const world = dialogProjectSettingsWorldDraftFixture()
  const worlds = [world]
  const documentTemplates = [buildDialogProjectSettingsDocumentTemplateDraft()]
  const layout = world.templateLayout

  const w = mount(DialogProjectSettingsPanelsColumn, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates,
      projectName: 'Panel name',
      projectNameHasError: false,
      selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB,
      worlds
    },
    global: {
      stubs: {
        DialogProjectSettingsGeneralPanel: true,
        DialogProjectSettingsDocumentTemplatesPanel: true,
        DialogProjectSettingsWorldsPanel: {
          props: ['worlds'],
          emits: [
            'addWorld',
            'removeWorld',
            'update:worlds',
            'updateWorldColor',
            'updateWorldColorPallete',
            'updateWorldDisplayNameTranslations',
            'updateDocumentTemplateTitleTranslations',
            'updateWorldTemplateLayout'
          ],
          template: `
            <div>
              <button type="button" data-test-locator="emit-add-world" @click="$emit('addWorld')" />
              <button type="button" data-test-locator="emit-remove-world" @click="$emit('removeWorld', worlds[0].id)" />
              <button type="button" data-test-locator="emit-update-worlds" @click="$emit('update:worlds', worlds)" />
              <button type="button" data-test-locator="emit-world-color" @click="$emit('updateWorldColor', worlds[0].id, '#112233')" />
              <button type="button" data-test-locator="emit-world-palette" @click="$emit('updateWorldColorPallete', worlds[0].id, '#112233;#445566')" />
              <button type="button" data-test-locator="emit-world-name" @click="$emit('updateWorldDisplayNameTranslations', worlds[0].id, { 'en-US': 'Renamed' })" />
              <button type="button" data-test-locator="emit-template-title" @click="$emit('updateDocumentTemplateTitleTranslations', 'template-id', { plural: {}, singular: {} })" />
              <button type="button" data-test-locator="emit-world-layout" @click="$emit('updateWorldTemplateLayout', worlds[0].id, worlds[0].templateLayout)" />
            </div>
          `
        },
        QSeparator: { template: '<hr />' },
        QTabPanel: { template: '<div><slot /></div>' },
        QTabPanels: { template: '<div><slot /></div>' }
      }
    }
  })

  await w.find('[data-test-locator="emit-add-world"]').trigger('click')
  expect(w.emitted('addWorld')).toBeTruthy()

  await w.find('[data-test-locator="emit-remove-world"]').trigger('click')
  expect(w.emitted('removeWorld')?.[0]).toEqual([world.id])

  await w.find('[data-test-locator="emit-update-worlds"]').trigger('click')
  expect(w.emitted('update:worlds')?.[0]).toEqual([worlds])

  await w.find('[data-test-locator="emit-world-color"]').trigger('click')
  expect(w.emitted('updateWorldColor')?.[0]).toEqual([world.id, '#112233'])

  await w.find('[data-test-locator="emit-world-palette"]').trigger('click')
  expect(w.emitted('updateWorldColorPallete')?.[0]).toEqual([world.id, '#112233;#445566'])

  await w.find('[data-test-locator="emit-world-name"]').trigger('click')
  expect(w.emitted('updateWorldDisplayNameTranslations')?.[0]).toEqual([world.id, { 'en-US': 'Renamed' }])

  await w.find('[data-test-locator="emit-template-title"]').trigger('click')
  expect(w.emitted('updateDocumentTemplateTitleTranslations')?.[0]).toEqual([
    'template-id',
    {
      plural: {},
      singular: {}
    }
  ])

  await w.find('[data-test-locator="emit-world-layout"]').trigger('click')
  expect(w.emitted('updateWorldTemplateLayout')?.[0]).toEqual([world.id, layout])
})

/**
 * DialogProjectSettingsPanelsColumn
 * Forwards document templates panel draft updates to parent emits.
 */
test('Test that DialogProjectSettingsPanelsColumn forwards document templates panel updates', async () => {
  const templates = [buildDialogProjectSettingsDocumentTemplateDraft()]

  const w = mount(DialogProjectSettingsPanelsColumn, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: templates,
      projectName: 'Panel name',
      projectNameHasError: false,
      selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB,
      worlds: []
    },
    global: {
      stubs: {
        DialogProjectSettingsGeneralPanel: true,
        DialogProjectSettingsWorldsPanel: true,
        DialogProjectSettingsDocumentTemplatesPanel: {
          props: ['templates'],
          emits: [
            'addTemplate',
            'removeTemplate',
            'update:templates',
            'updateTemplateTitleTranslations',
            'updateTemplateIcon',
            'updateTemplateWorldAppendixTranslations'
          ],
          template: `
            <div>
              <button type="button" data-test-locator="emit-add-template" @click="$emit('addTemplate')" />
              <button type="button" data-test-locator="emit-remove-template" @click="$emit('removeTemplate', templates[0].id)" />
              <button type="button" data-test-locator="emit-update-templates" @click="$emit('update:templates', templates)" />
              <button type="button" data-test-locator="emit-template-title" @click="$emit('updateTemplateTitleTranslations', templates[0].id, { plural: {}, singular: {} })" />
              <button type="button" data-test-locator="emit-template-icon" @click="$emit('updateTemplateIcon', templates[0].id, 'mdi-pencil')" />
              <button type="button" data-test-locator="emit-template-appendix" @click="$emit('updateTemplateWorldAppendixTranslations', templates[0].id, { 'en-US': 'Notes' })" />
            </div>
          `
        },
        QSeparator: { template: '<hr />' },
        QTabPanel: { template: '<div><slot /></div>' },
        QTabPanels: { template: '<div><slot /></div>' }
      }
    }
  })

  await w.find('[data-test-locator="emit-add-template"]').trigger('click')
  expect(w.emitted('addDocumentTemplate')).toBeTruthy()

  await w.find('[data-test-locator="emit-remove-template"]').trigger('click')
  expect(w.emitted('removeDocumentTemplate')?.[0]).toEqual([templates[0].id])

  await w.find('[data-test-locator="emit-update-templates"]').trigger('click')
  expect(w.emitted('update:documentTemplates')?.[0]).toEqual([templates])

  await w.find('[data-test-locator="emit-template-title"]').trigger('click')
  expect(w.emitted('updateDocumentTemplateTitleTranslations')?.[0]).toEqual([
    templates[0].id,
    {
      plural: {},
      singular: {}
    }
  ])

  await w.find('[data-test-locator="emit-template-icon"]').trigger('click')
  expect(w.emitted('updateDocumentTemplateIcon')?.[0]).toEqual([templates[0].id, 'mdi-pencil'])

  await w.find('[data-test-locator="emit-template-appendix"]').trigger('click')
  expect(w.emitted('updateDocumentTemplateWorldAppendixTranslations')?.[0]).toEqual([
    templates[0].id,
    { 'en-US': 'Notes' }
  ])
})
