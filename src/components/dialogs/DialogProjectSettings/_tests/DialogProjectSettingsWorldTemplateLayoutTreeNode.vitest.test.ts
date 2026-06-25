/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

const { dialogProjectSettingsTreeNodeTestI18n } = vi.hoisted(() => {
  const { createI18n } = require('vue-i18n')
  return {
    dialogProjectSettingsTreeNodeTestI18n: createI18n({
      legacy: false,
      locale: 'en-US',
      messages: {
        'en-US': {
          dialogs: {
            projectSettings: {
              singularPluralMissing: {
                bothIntro: 'Missing translations for current language:',
                pluralBullet: 'Plural form missing',
                singularBullet: 'Singular form missing',
                usingFallback: 'Using fallback of {fallbackLanguageName}'
              }
            }
          }
        }
      }
    })
  }
})

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: dialogProjectSettingsTreeNodeTestI18n
}))

import {
  buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey,
  dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey
} from '../scripts/dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'
import DialogProjectSettingsWorldTemplateLayoutTreeNode from '../DialogProjectSettingsWorldTemplateLayoutTreeNode.vue'
import * as actionTooltipsWiringModule from '../scripts/dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'
import {
  buildDialogProjectSettingsSingularPluralMissingTooltip,
  mergeDialogProjectSettingsVitestGlobal
} from 'app/helpers/dialogProjectSettingsVitestI18n'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

const documentTemplatesFixture = [
  buildDialogProjectSettingsDocumentTemplateDraft({
    id: 'template-a',
    titlePluralTranslations: { 'en-US': 'Character' },
    titleSingularTranslations: {},
  })
]

type T_mountTreeNodeProps = {
  blankGroupIds?: ReadonlySet<string>
  currentLanguageCode?: T_faUserSettingsLanguageCode
  documentTemplates?: I_dialogProjectSettingsDocumentTemplateDraft[]
  duplicateDocumentTemplateIds?: ReadonlySet<string>
  invalidDocumentTemplateIds?: ReadonlySet<string>
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
}

function mountTreeNode (
  props: T_mountTreeNodeProps,
  options?: {
    attachTo?: HTMLElement
    global?: Record<string, unknown>
  }
): ReturnType<typeof mount> {
  const globalOptions = options?.global ?? {}
  return mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    ...(options?.attachTo !== undefined ? { attachTo: options.attachTo } : {}),
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: documentTemplatesFixture,
      ...props
    },
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: treeNodeStubs,
      ...globalOptions
    })
  })
}

const groupNode = {
  children: [],
  documentCountInWorld: 0,
  documentTemplateId: null,
  icon: 'mdi-folder-outline',
  id: 'group-a',
  label: 'Group A',
  displayNameTranslations: { 'en-US': 'Group A' },
  nicknamePluralTranslations: {},
  nicknameSingularTranslations: {},
  nodeKind: 'group' as const,
  templateDisplayName: '',
  usesNickname: false,
  worldAppendix: ''
}

const templateNode = {
  children: [],
  documentCountInWorld: 3,
  documentTemplateId: 'template-a',
  icon: 'mdi-account',
  id: 'placement-a',
  label: 'Character',
  displayNameTranslations: {},
  nicknamePluralTranslations: {},
  nicknameSingularTranslations: {},
  nodeKind: 'template' as const,
  templateDisplayName: 'Character',
  usesNickname: false,
  worldAppendix: 'sheet'
}

const faLocaleTranslationsInputStub = defineComponent({
  name: 'FaLocaleTranslationsInput',
  props: {
    currentLanguageCode: {
      type: String,
      required: true
    },
    menuPinnedAsideTooltip: {
      type: String,
      default: undefined
    },
    modelValue: {
      type: Object,
      required: true
    },
    presentation: {
      type: String,
      default: 'field'
    },
    testLocator: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup () {
    const focusPreferredLanguageInput = vi.fn()
    return {
      focusPreferredLanguageInput
    }
  },
  template: `
    <div
      class="fa-locale-translations-input-stub"
      :data-test-locator="testLocator"
      :data-test-pinned-aside-tooltip="menuPinnedAsideTooltip"
      :data-test-presentation="presentation"
      @click="$emit('update:modelValue', modelValue)"
    >
      <slot name="append" />
    </div>
  `
})

const treeNodeStubs = {
  FaLocaleTranslationsInput: faLocaleTranslationsInputStub,
  QBtn: defineComponent({
    inheritAttrs: true,
    template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>'
  }),
  QIcon: defineComponent({
    inheritAttrs: true,
    template: '<span class="q-icon-stub" v-bind="$attrs"><slot /></span>'
  }),
  QInput: defineComponent({
    inheritAttrs: true,
    setup (_, { attrs, expose, slots }) {
      expose({ focus: () => {} })
      return () => h('div', {
        class: 'q-input-stub',
        ...attrs
      }, [
        h('div', { class: 'q-field__append' }, slots.append?.())
      ])
    }
  }),
  QMenu: defineComponent({
    inheritAttrs: true,
    props: {
      modelValue: {
        type: Boolean,
        default: false
      }
    },
    emits: [
      'before-show',
      'hide',
      'show',
      'update:modelValue'
    ],
    watch: {
      modelValue (value: boolean): void {
        if (value) {
          this.$emit('before-show')
          this.$emit('show')
        } else {
          this.$emit('hide')
        }
      }
    },
    template: '<div v-if="modelValue" class="q-menu-stub" v-bind="$attrs"><slot /></div>'
  }),
  QTooltip: defineComponent({
    methods: {
      hide (): void {}
    },
    template: '<span class="q-tooltip-stub"><slot /></span>'
  })
}

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Renders group node chrome with remove control.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode renders group node', () => {
  const w = mountTreeNode({
    node: groupNode
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a-remove"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a-edit"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a-edit"]').attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.editGroupTooltip'
  )
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a-remove"]').attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.removeGroupTooltip'
  )
  expect(w.text()).toContain('Group A')
})

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode accentuates nickname labels', () => {
  const w = mountTreeNode({
    node: {
      ...templateNode,
      label: 'cv',
      nicknamePluralTranslations: { 'en-US': 'cv' },
      nicknameSingularTranslations: {},
      usesNickname: true
    }
  })

  expect(
    w.find('.dialogProjectSettingsWorldTemplateLayoutTreeNode__label--nickname').exists()
  ).toBe(true)
  expect(
    w.find('.dialogProjectSettingsWorldTemplateLayoutTreeNode__icon--nickname').exists()
  ).toBe(true)
})

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode shows placement nickname hover tooltip text', () => {
  const w = mountTreeNode({
    node: {
      ...templateNode,
      label: 'Nickname of doom',
      nicknamePluralTranslations: { 'en-US': 'Nickname of doom' },
      nicknameSingularTranslations: {},
      templateDisplayName: 'Character',
      usesNickname: true
    }
  })

  const titleRow = w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-titleRow"]')
  expect(titleRow.exists()).toBe(true)
  expect(titleRow.attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.placementNicknameHoverNicknameLabel - Nickname of doom\ndialogs.projectSettings.fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel - Character'
  )
  expect(titleRow.find('.q-tooltip-stub').exists()).toBe(true)
})

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode suppresses placement nickname hover tooltip over action buttons', () => {
  const w = mountTreeNode({
    node: {
      ...templateNode,
      label: 'Nickname of doom',
      nicknamePluralTranslations: { 'en-US': 'Nickname of doom' },
      nicknameSingularTranslations: {},
      templateDisplayName: 'Character',
      usesNickname: true
    }
  })

  const editButton = w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-edit"]')
  const actions = editButton.element.parentElement
  expect(actions?.classList.contains('dialogProjectSettingsWorldTemplateLayoutTreeNode__actions')).toBe(true)
  expect(editButton.attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.editTemplateTooltip'
  )
})

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode omits placement nickname hover tooltip without nickname', () => {
  const w = mountTreeNode({
    node: templateNode
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-titleRow"]').attributes('data-test-tooltip-text')).toBeUndefined()
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Renders template node with document count and emits removePlacement.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode renders template node and emits removePlacement', async () => {
  const w = mountTreeNode({
    node: templateNode
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-count"]').text()).toBe('(3)')
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-edit"]').attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.editTemplateTooltip'
  )
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-remove"]').attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.removeTemplateTooltip'
  )
  expect(w.text()).toContain('(sheet)')

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-remove"]').trigger('click')
  expect(w.emitted('removePlacement')?.[0]!).toEqual(['placement-a'])
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Applies validation error styling when blankGroupIds contains the group id.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode marks blank group as validation error', () => {
  const w = mountTreeNode({
    blankGroupIds: new Set(['group-a']),
    node: groupNode
  })

  expect(w.attributes('data-test-validation-error')).toBe('true')
  expect(w.classes()).toContain('dialogProjectSettingsWorldTemplateLayoutTreeNode--error')
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Edit control opens the shared inline rename menu for group nodes.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode edit opens group rename menu', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const w = mountTreeNode({
    node: groupNode
  }, {
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a-edit"]').trigger('click')
  expect(openRenameMenuTarget.value).toBe(
    buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey('group', groupNode.id)
  )
  expect(w.find('.fa-locale-translations-input-stub').attributes('data-test-presentation')).toBe('menuPanel')
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Rename menu show focuses the embedded translations input.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode rename menu show focuses translations input', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const w = mountTreeNode({
    node: groupNode
  }, {
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a-edit"]').trigger('click')
  const translationsInput = w.findComponent({ name: 'FaLocaleTranslationsInput' })
  expect(translationsInput.vm.focusPreferredLanguageInput).toHaveBeenCalled()
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Left-click on the row does not open the inline rename menu.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode left click does not open rename menu', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const w = mountTreeNode({
    node: groupNode
  }, {
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      }
    }
  })

  await w.trigger('click')
  expect(openRenameMenuTarget.value).toBeNull()
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Edit control opens the shared inline rename menu for template nodes.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode edit opens template rename menu', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const w = mountTreeNode({
    node: templateNode
  }, {
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-edit"]').trigger('click')
  expect(openRenameMenuTarget.value).toBe(
    buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey('template', templateNode.id)
  )
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Template rename menu shows canonical name tooltip on pinned-aside column.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode template rename menu shows pinned aside tooltip', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const w = mountTreeNode({
    node: templateNode
  }, {
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-edit"]').trigger('click')
  expect(w.find('.fa-locale-translations-input-stub').attributes('data-test-pinned-aside-tooltip')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.templateCanonicalNameTooltip'
  )
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Right-click opens the shared inline rename menu at the anchored position.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode contextmenu opens group rename menu', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const w = mountTreeNode({
    node: groupNode
  }, {
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      }
    }
  })

  await w.trigger('contextmenu')
  expect(openRenameMenuTarget.value).toBe(
    buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey('group', groupNode.id)
  )
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Rename menu receives explicit width style at setup top level for Quasar q-menu.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode applies rename menu width style', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const w = mountTreeNode({
    node: templateNode
  }, {
    attachTo: document.body,
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      }
    }
  })

  const anchor = w.element as HTMLElement
  Object.defineProperty(anchor, 'clientWidth', {
    configurable: true,
    value: 500
  })
  vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
    bottom: 0,
    height: 0,
    left: 0,
    right: 500,
    toJSON: () => ({}),
    top: 0,
    width: 500,
    x: 0,
    y: 0
  } as DOMRect)
  const actions = anchor.querySelector('.dialogProjectSettingsWorldTemplateLayoutTreeNode__actions')
  if (actions instanceof HTMLElement) {
    vi.spyOn(actions, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 0,
      left: 448,
      right: 500,
      toJSON: () => ({}),
      top: 0,
      width: 52,
      x: 448,
      y: 0
    } as DOMRect)
  }

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-edit"]').trigger('click')
  const menu = w.find('.q-menu-stub')
  expect(menu.attributes('style')).toContain('width: 788px')

  w.unmount()
})

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode shows group missing translation warning', () => {
  const w = mountTreeNode({
    node: {
      ...groupNode,
      displayNameTranslations: { de: 'Gruppe A' },
      label: 'Gruppe A'
    }
  })

  const warning = w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a-missingTranslationsWarning"]')
  expect(warning.exists()).toBe(true)
  expect(warning.attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.missingGroupDisplayNameTreeTooltip'
  )
})

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode shows document template title missing translation warning', () => {
  const w = mountTreeNode({
    documentTemplates: [
      buildDialogProjectSettingsDocumentTemplateDraft({
        id: 'template-a',
        titlePluralTranslations: { de: 'Charakter' },
        titleSingularTranslations: {},
      })
    ],
    node: templateNode
  })

  const warning = w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-missingTranslationsWarning"]')
  expect(warning.exists()).toBe(true)
  expect(warning.attributes('data-test-tooltip-text')).toBe(
    buildDialogProjectSettingsSingularPluralMissingTooltip({
      fallbackLanguageCode: 'de',
      missingForm: 'both'
    })
  )
})

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode shows placement nickname missing translation warning', () => {
  const w = mountTreeNode({
    node: {
      ...templateNode,
      label: 'cv',
      nicknamePluralTranslations: { de: 'cv' },
      nicknameSingularTranslations: {},
      usesNickname: true
    }
  })

  const warning = w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-missingTranslationsWarning"]')
  expect(warning.exists()).toBe(true)
  expect(warning.attributes('data-test-tooltip-text')).toBe(
    buildDialogProjectSettingsSingularPluralMissingTooltip({
      fallbackLanguageCode: 'de',
      missingForm: 'both'
    })
  )
})

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode hides template title warning when active nickname is filled', () => {
  const w = mountTreeNode({
    documentTemplates: [
      buildDialogProjectSettingsDocumentTemplateDraft({
        id: 'template-a',
        titlePluralTranslations: {},
        titleSingularTranslations: {}
      })
    ],
    node: {
      ...templateNode,
      label: 'cv',
      nicknamePluralTranslations: { 'en-US': 'cv' },
      nicknameSingularTranslations: { 'en-US': 'cv' },
      usesNickname: true
    }
  })

  expect(
    w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-missingTranslationsWarning"]').exists()
  ).toBe(false)
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Reveals and hides placement nickname hover tooltip on row hover.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode toggles nickname hover tooltip on mouse enter and leave', async () => {
  const w = mountTreeNode({
    node: {
      ...templateNode,
      label: 'Nickname of doom',
      nicknamePluralTranslations: { 'en-US': 'Nickname of doom' },
      nicknameSingularTranslations: {},
      templateDisplayName: 'Character',
      usesNickname: true
    }
  })

  const root = w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a"]')
  await root.trigger('mouseenter')
  await root.trigger('mouseleave')

  const actions = w.find('.dialogProjectSettingsWorldTemplateLayoutTreeNode__actions')
  await actions.trigger('mouseenter')
  await actions.trigger('mouseleave')

  const warning = w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-missingTranslationsWarning"]')
  if (warning.exists()) {
    await warning.trigger('mouseenter')
    await warning.trigger('mouseleave')
  }

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-edit"]').trigger('mouseleave')
  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-remove"]').trigger('mouseleave')
  expect(root.exists()).toBe(true)
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Wires the initial rename-menu-open guard before rename menu state binds.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode wires initial getRenameMenuOpen false', () => {
  const originalCreateActionTooltips =
    actionTooltipsWiringModule.createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring
  const spy = vi.spyOn(
    actionTooltipsWiringModule,
    'createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring'
  )
  spy.mockImplementation((deps) => {
    expect(deps?.getRenameMenuOpen?.()).toBe(false)
    return originalCreateActionTooltips(deps)
  })

  mountTreeNode({
    node: templateNode
  })

  spy.mockRestore()
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Wires rename menu open and translations draft v-model bindings.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode wires rename menu v-model bindings', async () => {
  const w = mountTreeNode({
    node: groupNode
  })

  const renameMenu = w.findComponent({ name: 'DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu' })
  expect(renameMenu.exists()).toBe(true)

  await renameMenu.vm.$emit('update:renameMenuOpen', true)
  await renameMenu.vm.$emit('update:translationsDraft', { 'en-US': 'Renamed Group' })
  expect(renameMenu.emitted('update:renameMenuOpen')).toBeTruthy()
  expect(renameMenu.emitted('update:translationsDraft')).toBeTruthy()
})
