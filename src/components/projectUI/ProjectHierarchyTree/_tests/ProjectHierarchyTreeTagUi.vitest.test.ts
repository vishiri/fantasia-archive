/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import ProjectHierarchyTreeDeleteTagDialog from '../ProjectHierarchyTreeDeleteTagDialog.vue'
import ProjectHierarchyTreeNodeContextMenuTagRows from '../ProjectHierarchyTreeNodeContextMenuTagRows.vue'
import ProjectHierarchyTreeNodeMenusHost from '../ProjectHierarchyTreeNodeMenusHost.vue'
import ProjectHierarchyTreeRenameTagDialog from '../ProjectHierarchyTreeRenameTagDialog.vue'
import ProjectHierarchyTreeTagDialogsHost from '../ProjectHierarchyTreeTagDialogsHost.vue'

const tagDialogsI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectHierarchyTree: {
          deleteTagConfirm: {
            cancelButton: 'Cancel',
            deleteButton: 'Delete Tag',
            foreverWord: 'FOREVER',
            proceedPrompt: 'Proceed?',
            titlePrefix: 'Delete',
            titleSuffix: '?',
            warningPrefix: 'The tag will be deleted ',
            warningSuffix: ' with no way to revert this change.'
          },
          renameTagDialog: {
            cancel: 'Cancel',
            confirm: 'Rename Tag',
            description: 'If you input a tag name that already exists, the documents will be added to it and different text cases will be unified to the form of the already existing tag.',
            mergeWarningTooltip: 'Merges into existing tag',
            nameLabel: 'New tag name',
            title: 'Rename Tag'
          },
          contextMenu: {
            addNewDocumentToThisTag: 'Add new document to this tag',
            deleteTag: 'Delete tag',
            renameTag: 'Rename tag'
          }
        }
      }
    }
  }
})

const quasarDialogStubs = {
  QBtn: {
    emits: ['click'],
    props: ['disable', 'label'],
    template: '<button type="button" :disabled="disable" @click="$emit(\'click\')"><slot />{{ label }}</button>'
  },
  QCard: { template: '<div><slot /></div>' },
  QCardActions: { template: '<div><slot /></div>' },
  QCardSection: { template: '<div><slot /></div>' },
  QDialog: {
    emits: ['hide', 'show', 'update:modelValue'],
    props: ['modelValue'],
    template: '<div v-if="modelValue"><slot /><button data-test-locator="dialog-hide" type="button" @click="$emit(\'hide\')" /><button data-test-locator="dialog-close" type="button" @click="$emit(\'update:modelValue\', false)" /><button data-test-locator="dialog-open" type="button" @click="$emit(\'update:modelValue\', true)" /><button data-test-locator="dialog-show" type="button" @click="$emit(\'show\')" /></div>'
  },
  QIcon: {
    inheritAttrs: false,
    template: '<i v-bind="$attrs"><slot /></i>'
  },
  QInput: {
    emits: ['update:modelValue', 'keydown'],
    methods: {
      focus (): void {
        // stub focus — component under test calls QInput.focus()
      }
    },
    props: ['modelValue', 'label'],
    template: '<div><label class="q-field__label">{{ label }}</label><input :data-test-locator="$attrs[\'data-test-locator\']" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keydown="$emit(\'keydown\', $event)" /><slot name="append" /></div>'
  },
  QTooltip: { template: '<span><slot /></span>' }
}

/**
 * ProjectHierarchyTreeDeleteTagDialog
 * Renders confirm copy and wires cancel/confirm + model hide.
 */
test('Test that ProjectHierarchyTreeDeleteTagDialog handles empty tag name and model close', async () => {
  const onCancel = vi.fn()
  const wrapper = mount(ProjectHierarchyTreeDeleteTagDialog, {
    props: {
      isOpen: true,
      onCancel,
      onConfirm: vi.fn(),
      tagName: ''
    },
    global: {
      plugins: [tagDialogsI18n],
      stubs: quasarDialogStubs
    }
  })
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-title"]').text()).toContain('Delete')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-title"]').text()).toContain('?')
  await wrapper.find('[data-test-locator="dialog-close"]').trigger('click')
  expect(onCancel).toHaveBeenCalled()
})

/**
 * ProjectHierarchyTreeDeleteTagDialog
 * Ignores cancel when dialog model updates to shown=true.
 */
test('Test that ProjectHierarchyTreeDeleteTagDialog ignores open model update', async () => {
  const onCancel = vi.fn()
  const wrapper = mount(ProjectHierarchyTreeDeleteTagDialog, {
    props: {
      isOpen: true,
      onCancel,
      onConfirm: vi.fn(),
      tagName: 'Heroes'
    },
    global: {
      plugins: [tagDialogsI18n],
      stubs: quasarDialogStubs
    }
  })
  onCancel.mockClear()
  await wrapper.find('[data-test-locator="dialog-open"]').trigger('click')
  expect(onCancel).not.toHaveBeenCalled()
})

test('Test that ProjectHierarchyTreeDeleteTagDialog confirms and cancels', async () => {
  const onCancel = vi.fn()
  const onConfirm = vi.fn()
  const wrapper = mount(ProjectHierarchyTreeDeleteTagDialog, {
    props: {
      isOpen: true,
      onCancel,
      onConfirm,
      tagName: 'Heroes'
    },
    global: {
      plugins: [tagDialogsI18n],
      stubs: quasarDialogStubs
    }
  })
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-title"]').text()).toContain('Heroes')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-title"] .text-primary-bright').text()).toBe('Heroes')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-warning"]').text()).toContain('FOREVER')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-proceed"]').text()).toBe('Proceed?')
  expect(wrapper.find('.faConfirmationDialog').exists()).toBe(true)
  await wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-confirm"]').trigger('click')
  expect(onConfirm).toHaveBeenCalled()
  await wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-cancel"]').trigger('click')
  expect(onCancel).toHaveBeenCalled()
  await wrapper.find('[data-test-locator="dialog-close"]').trigger('click')
  expect(onCancel.mock.calls.length).toBeGreaterThanOrEqual(2)
})

/**
 * ProjectHierarchyTreeRenameTagDialog
 * Updates name draft and shows merge warning append icon.
 */
test('Test that ProjectHierarchyTreeRenameTagDialog edits name and confirms', async () => {
  const onCancel = vi.fn()
  const onConfirm = vi.fn()
  const wrapper = mount(ProjectHierarchyTreeRenameTagDialog, {
    props: {
      canConfirm: true,
      isOpen: true,
      nameDraft: 'Heroes',
      onCancel,
      onConfirm,
      showsMergeWarning: true,
      tagName: 'Heroes',
      'onUpdate:nameDraft': (value: string) => {
        void wrapper.setProps({ nameDraft: value })
      }
    },
    global: {
      plugins: [tagDialogsI18n],
      stubs: quasarDialogStubs
    }
  })
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-title"]').text()).toBe('Rename Tag')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-currentName"]').text()).toBe('Heroes')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-currentName"]').classes()).toContain('text-primary-bright')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-description"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-name"] .q-field__label').text())
    .toBe('New tag name')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-mergeWarning"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-mergeWarning"]').classes()).toContain('cursor-pointer')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-confirm"]').text()).toBe('Rename Tag')
  const input = wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-name"] input')
  await input.setValue('Places')
  await wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-confirm"]').trigger('click')
  expect(onConfirm).toHaveBeenCalled()
  await wrapper.find('[data-test-locator="dialog-close"]').trigger('click')
  expect(onCancel).toHaveBeenCalled()
})

/**
 * ProjectHierarchyTreeRenameTagDialog
 * Focuses name input when dialog show fires so typing can start immediately.
 */
test('Test that ProjectHierarchyTreeRenameTagDialog focuses name input on show', async () => {
  const focusSpy = vi.fn()
  const wrapper = mount(ProjectHierarchyTreeRenameTagDialog, {
    props: {
      canConfirm: false,
      isOpen: true,
      nameDraft: '',
      onCancel: vi.fn(),
      onConfirm: vi.fn(),
      showsMergeWarning: false,
      tagName: 'Heroes'
    },
    global: {
      plugins: [tagDialogsI18n],
      stubs: {
        ...quasarDialogStubs,
        QInput: {
          ...quasarDialogStubs.QInput,
          methods: {
            focus: focusSpy
          }
        }
      }
    }
  })
  await wrapper.find('[data-test-locator="dialog-show"]').trigger('click')
  await Promise.resolve()
  expect(focusSpy).toHaveBeenCalled()
})

/**
 * ProjectHierarchyTreeRenameTagDialog
 * Enter confirms when allowed and no-ops when confirm is disabled.
 */
test('Test that ProjectHierarchyTreeRenameTagDialog confirms on enter when allowed', async () => {
  const onCancel = vi.fn()
  const onConfirm = vi.fn()
  const wrapper = mount(ProjectHierarchyTreeRenameTagDialog, {
    props: {
      canConfirm: true,
      isOpen: true,
      nameDraft: 'Places',
      onCancel,
      onConfirm,
      showsMergeWarning: false,
      tagName: 'Heroes'
    },
    global: {
      plugins: [tagDialogsI18n],
      stubs: {
        ...quasarDialogStubs,
        QInput: {
          inheritAttrs: false,
          emits: ['update:modelValue'],
          props: ['modelValue', 'label'],
          template: `
            <div class="q-input-stub" v-bind="$attrs">
              <label class="q-field__label">{{ label }}</label>
              <input
                data-test-locator="projectHierarchyTree-renameTagDialog-name"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
              />
              <slot name="append" />
            </div>
          `
        }
      }
    }
  })
  await wrapper.get('.q-input-stub').trigger('keydown.enter')
  expect(onConfirm).toHaveBeenCalledTimes(1)

  await wrapper.setProps({ canConfirm: false })
  await wrapper.get('.q-input-stub').trigger('keydown.enter')
  expect(onConfirm).toHaveBeenCalledTimes(1)
})

/**
 * ProjectHierarchyTreeTagDialogsHost
 * Hosts rename + delete dialogs with i18n labels.
 */
test('Test that ProjectHierarchyTreeTagDialogsHost mounts rename and delete dialogs', async () => {
  const onConfirmDeleteTag = vi.fn()
  const onConfirmRenameTag = vi.fn()
  const onDismissDeleteTagDialog = vi.fn()
  const onDismissRenameTagDialog = vi.fn()
  const renameDraft = ref('Heroes')
  const wrapper = mount(ProjectHierarchyTreeTagDialogsHost, {
    props: {
      deleteTagConfirmOpen: false,
      deleteTagName: 'Heroes',
      onConfirmDeleteTag,
      onConfirmRenameTag,
      onDismissDeleteTagDialog,
      onDismissRenameTagDialog,
      renameTagCanConfirm: true,
      renameTagCurrentName: 'Heroes',
      renameTagDialogOpen: true,
      renameTagMergeWarning: false,
      renameTagNameDraft: renameDraft.value,
      'onUpdate:renameTagNameDraft': (value: string) => {
        renameDraft.value = value
      }
    },
    global: {
      plugins: [tagDialogsI18n],
      stubs: quasarDialogStubs
    }
  })
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-title"]').text()).toBe('Rename Tag')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-currentName"]').text()).toBe('Heroes')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-name"] input').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-cancel"]').text()).toBe('Cancel')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-confirm"]').text()).toBe('Rename Tag')
  wrapper.setProps({ deleteTagConfirmOpen: true })
  await wrapper.vm.$nextTick()
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-title"]').text()).toContain('Heroes')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-warning"]').text()).toContain('FOREVER')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-cancel"]').text()).toBe('Cancel')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-confirm"]').text()).toBe('Delete Tag')
  const renameInput = wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-name"] input')
  await renameInput.setValue('Places')
  expect(renameDraft.value).toBe('Places')
  await wrapper.find('[data-test-locator="projectHierarchyTree-renameTagDialog-confirm"]').trigger('click')
  expect(onConfirmRenameTag).toHaveBeenCalled()
  await wrapper.find('[data-test-locator="projectHierarchyTree-deleteTagDialog-confirm"]').trigger('click')
  expect(onConfirmDeleteTag).toHaveBeenCalled()
  await wrapper.find('[data-test-locator="dialog-close"]').trigger('click')
  expect(onDismissRenameTagDialog).toHaveBeenCalled()
})

/**
 * ProjectHierarchyTreeNodeContextMenuTagRows
 * Renders add/rename/delete tag rows and placement submenu clicks.
 */
test('Test that ProjectHierarchyTreeNodeContextMenuTagRows wires tag menu actions', async () => {
  const onAddNewDocumentToThisTagClick = vi.fn()
  const onAddToTagSubmenuActivatorEnter = vi.fn()
  const onAddToTagSubmenuModelUpdate = vi.fn()
  const onDeleteTagClick = vi.fn()
  const onRenameTagClick = vi.fn()
  const onSubmenuActivatorLeave = vi.fn()
  const onSubmenuContentEnter = vi.fn()
  const onSubmenuContentLeave = vi.fn()
  const wrapper = mount(ProjectHierarchyTreeNodeContextMenuTagRows, {
    props: {
      addDocumentPlacementOptions: [
        {
          icon: 'mdi-account',
          label: 'Character',
          nodeId: 'placement-1',
          templateId: 'tpl-1',
          worldId: 'world-1'
        },
        {
          icon: 'mdi-home',
          label: 'Place',
          nodeId: 'placement-2',
          templateId: 'tpl-2',
          worldId: 'world-1'
        }
      ],
      addNewDocumentToThisTagLabel: 'Add new document to this tag',
      deleteTagLabel: 'Delete tag',
      isAddToTagSubmenuOpen: true,
      onAddNewDocumentToThisTagClick,
      onAddToTagSubmenuActivatorEnter,
      onAddToTagSubmenuModelUpdate,
      onDeleteTagClick,
      onRenameTagClick,
      onSubmenuActivatorLeave,
      onSubmenuContentEnter,
      onSubmenuContentLeave,
      renameTagLabel: 'Rename tag'
    },
    global: {
      stubs: {
        QIcon: true,
        QItem: {
          emits: ['click', 'mouseenter', 'mouseleave'],
          template: '<button type="button" @click="$emit(\'click\')" @mouseenter="$emit(\'mouseenter\')" @mouseleave="$emit(\'mouseleave\')"><slot /></button>'
        },
        QItemSection: { template: '<span><slot /></span>' },
        QList: { template: '<div><slot /></div>' },
        QMenu: {
          emits: ['mouseenter', 'mouseleave', 'update:modelValue'],
          props: ['modelValue'],
          template: '<div @mouseenter="$emit(\'mouseenter\')" @mouseleave="$emit(\'mouseleave\')"><button data-test-locator="submenu-close" type="button" @click="$emit(\'update:modelValue\', false)" /><slot /></div>'
        },
        QSeparator: {
          template: '<hr class="projectHierarchyTreeNodeContextMenu__separatorAlt" />'
        }
      }
    }
  })
  const submenuHtml = wrapper.find(
    '[data-test-locator="projectHierarchyTree-nodeContextMenu-addNewDocumentToThisTagSubmenu"]'
  ).html()
  expect(submenuHtml.match(/projectHierarchyTreeNodeContextMenu__separatorAlt/g)?.length).toBe(1)
  await wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-addNewDocumentToThisTag"]').trigger('mouseenter')
  expect(onAddToTagSubmenuActivatorEnter).toHaveBeenCalled()
  await wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-addNewDocumentToThisTag-placement-1"]').trigger('click')
  expect(onAddNewDocumentToThisTagClick).toHaveBeenCalledWith('placement-1')
  await wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-renameTag"]').trigger('click')
  expect(onRenameTagClick).toHaveBeenCalled()
  await wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-deleteTag"]').trigger('click')
  expect(onDeleteTagClick).toHaveBeenCalled()
  await wrapper.find('[data-test-locator="submenu-close"]').trigger('click')
  expect(onAddToTagSubmenuModelUpdate).toHaveBeenCalledWith(false)
})

/**
 * ProjectHierarchyTreeNodeMenusHost
 * Forwards context menu + tag dialog host props.
 */
test('Test that ProjectHierarchyTreeNodeMenusHost mounts menu and tag dialog host', async () => {
  const isOpen = ref(true)
  const renameDraft = ref('Heroes')
  const wrapper = mount(ProjectHierarchyTreeNodeMenusHost, {
    props: {
      addDocumentPlacementOptions: [],
      addNewRowIcon: null,
      addNewRowLabel: null,
      anchorNodeId: 'tag-1',
      deleteTagConfirmOpen: false,
      deleteTagName: '',
      isNodeContextMenuOpen: isOpen.value,
      menuPointerPosition: {
        left: 10,
        top: 20
      },
      onAddNewClick: vi.fn(),
      onAddNewDocumentToThisTagClick: vi.fn(),
      onAddNewDocumentUnderThisClick: vi.fn(),
      onCollapseAllClick: vi.fn(),
      onConfirmDeleteTag: vi.fn(),
      onConfirmRenameTag: vi.fn(),
      onCopyBackgroundColorClick: vi.fn(),
      onCopyDocumentClick: vi.fn(),
      onCopyNameClick: vi.fn(),
      onCopyTextColorClick: vi.fn(),
      onDeleteDocumentClick: vi.fn(),
      onDeleteTagClick: vi.fn(),
      onDismissDeleteTagDialog: vi.fn(),
      onDismissRenameTagDialog: vi.fn(),
      onEditDocumentClick: vi.fn(),
      onExpandAllClick: vi.fn(),
      onHide: vi.fn(),
      onOpenDocumentClick: vi.fn(),
      onRenameTagClick: vi.fn(),
      onSortByItemClick: vi.fn(),
      renameTagCanConfirm: false,
      renameTagCurrentName: '',
      renameTagDialogOpen: false,
      renameTagMergeWarning: false,
      renameTagNameDraft: renameDraft.value,
      showsBulkExpandRows: false,
      showsCopyRows: false,
      showsDocumentOpenEditRows: false,
      showsSortByRows: false,
      sortByDirectScopeOnly: false,
      showsTagMenuRows: true,
      'onUpdate:isNodeContextMenuOpen': (value: boolean) => {
        isOpen.value = value
      },
      'onUpdate:renameTagNameDraft': (value: string) => {
        renameDraft.value = value
      }
    },
    global: {
      plugins: [tagDialogsI18n],
      stubs: {
        ...quasarDialogStubs,
        QIcon: true,
        QItem: {
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>'
        },
        QItemSection: { template: '<span><slot /></span>' },
        QList: { template: '<div><slot /></div>' },
        QMenu: {
          props: ['modelValue'],
          template: '<div v-if="modelValue"><slot /></div>'
        },
        QSeparator: { template: '<hr />' },
        ProjectHierarchyTreeNodeContextMenuBulkRows: true,
        ProjectHierarchyTreeNodeContextMenuCopyRows: true,
        ProjectHierarchyTreeNodeContextMenuDeleteRow: true,
        ProjectHierarchyTreeNodeContextMenuDocumentRows: true,
        ProjectHierarchyTreeNodeContextMenuSortByRow: true,
        ProjectHierarchyTreeNodeContextMenuTagRows: {
          template: '<div data-test-locator="menus-host-tag-rows" />'
        }
      }
    }
  })
  expect(wrapper.find('[data-test-locator="menus-host-tag-rows"]').exists()).toBe(true)
  expect(wrapper.findComponent({ name: 'ProjectHierarchyTreeTagDialogsHost' }).exists()).toBe(true)
  const contextMenu = wrapper.findComponent({ name: 'ProjectHierarchyTreeNodeContextMenu' })
  await contextMenu.vm.$emit('update:isOpen', false)
  expect(isOpen.value).toBe(false)
  const tagDialogsHost = wrapper.findComponent({ name: 'ProjectHierarchyTreeTagDialogsHost' })
  await tagDialogsHost.vm.$emit('update:renameTagNameDraft', 'Places')
  expect(renameDraft.value).toBe('Places')
})
