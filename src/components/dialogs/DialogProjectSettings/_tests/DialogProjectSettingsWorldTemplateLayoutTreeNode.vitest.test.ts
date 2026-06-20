/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import {
  buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey,
  dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey
} from '../scripts/dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'
import DialogProjectSettingsWorldTemplateLayoutTreeNode from '../DialogProjectSettingsWorldTemplateLayoutTreeNode.vue'

const groupNode = {
  children: [],
  documentCountInWorld: 0,
  documentTemplateId: null,
  icon: 'mdi-folder-outline',
  id: 'group-a',
  label: 'Group A',
  nickname: '',
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
  nickname: '',
  nodeKind: 'template' as const,
  templateDisplayName: 'Character',
  usesNickname: false,
  worldAppendix: ' sheet'
}

const treeNodeStubs = {
  QBtn: defineComponent({
    inheritAttrs: true,
    template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)" />'
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
    template: '<div class="q-menu-stub" v-bind="$attrs"><slot /></div>'
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
  const w = mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    props: {
      node: groupNode
    },
    global: {
      stubs: treeNodeStubs
    }
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
  const w = mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    props: {
      node: {
        ...templateNode,
        label: 'cv',
        nickname: 'cv',
        usesNickname: true
      }
    },
    global: {
      stubs: treeNodeStubs
    }
  })

  expect(
    w.find('.dialogProjectSettingsWorldTemplateLayoutTreeNode__label--nickname').exists()
  ).toBe(true)
  expect(
    w.find('.dialogProjectSettingsWorldTemplateLayoutTreeNode__icon--nickname').exists()
  ).toBe(true)
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Renders template node with document count and emits removePlacement.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode renders template node and emits removePlacement', async () => {
  const w = mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    props: {
      node: templateNode
    },
    global: {
      stubs: treeNodeStubs
    }
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
  expect(w.emitted('removePlacement')?.[0]).toEqual(['placement-a'])
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Applies validation error styling when blankGroupIds contains the group id.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode marks blank group as validation error', () => {
  const w = mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    props: {
      blankGroupIds: new Set(['group-a']),
      node: groupNode
    },
    global: {
      stubs: treeNodeStubs
    }
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
  const w = mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    props: {
      node: groupNode
    },
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      },
      stubs: treeNodeStubs
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a-edit"]').trigger('click')
  expect(openRenameMenuTarget.value).toBe(
    buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey('group', groupNode.id)
  )
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Left-click on the row does not open the inline rename menu.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode left click does not open rename menu', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const w = mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    props: {
      node: groupNode
    },
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      },
      stubs: treeNodeStubs
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
  const w = mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    props: {
      node: templateNode
    },
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      },
      stubs: treeNodeStubs
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-edit"]').trigger('click')
  expect(openRenameMenuTarget.value).toBe(
    buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey('template', templateNode.id)
  )
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Template rename menu shows help tooltip icons on nickname and canonical name inputs.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode template rename menu shows help tooltip icons', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const w = mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    props: {
      node: templateNode
    },
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      },
      stubs: treeNodeStubs
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a-edit"]').trigger('click')
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTemplateNicknameTooltipIcon"]').attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.templateNicknameTooltip'
  )
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTemplateCanonicalNameTooltipIcon"]').attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.templateCanonicalNameTooltip'
  )
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNode
 * Right-click opens the shared inline rename menu at the anchored position.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNode contextmenu opens group rename menu', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const w = mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    props: {
      node: groupNode
    },
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      },
      stubs: treeNodeStubs
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
  const w = mount(DialogProjectSettingsWorldTemplateLayoutTreeNode, {
    attachTo: document.body,
    props: {
      node: templateNode
    },
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      },
      stubs: treeNodeStubs
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
  expect(menu.attributes('style')).toContain('width: 436px')

  w.unmount()
})
