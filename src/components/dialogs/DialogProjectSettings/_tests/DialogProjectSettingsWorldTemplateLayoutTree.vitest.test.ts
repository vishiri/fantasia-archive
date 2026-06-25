/* eslint-disable vue/one-component-per-file, vue/require-prop-types -- colocated stub components for Vue Test Utils mounts */

import { mount, flushPromises } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import DialogProjectSettingsWorldTemplateLayoutTree from '../DialogProjectSettingsWorldTemplateLayoutTree.vue'
import { createEmptyDialogProjectSettingsWorldTemplateLayoutDraft } from '../scripts/dialogProjectSettingsWorldTemplateLayoutDraft'
import { appendDialogProjectSettingsWorldTemplatePlacementDraft } from '../scripts/dialogProjectSettingsWorldTemplateLayoutDraft'

const heTreeEmitters: {
  afterDrop?: () => void
  beforeDragStart?: () => void
  dragend?: () => void
  updateModelValue?: (nodes: unknown[]) => void
} = {}

vi.mock('@he-tree/vue', () => {
  const Draggable = defineComponent({
    name: 'DraggableStub',
    props: {
      modelValue: {
        required: true,
        type: Array
      },
      eachDraggable: {
        type: Function,
        default: undefined
      },
      eachDroppable: {
        type: Function,
        default: undefined
      },
      rootDroppable: {
        type: Function,
        default: undefined
      }
    },
    emits: [
      'after-drop',
      'before-drag-start',
      'dragend',
      'update:model-value'
    ],
    setup (props, {
      emit,
      slots
    }) {
      heTreeEmitters.afterDrop = () => emit('after-drop')
      heTreeEmitters.beforeDragStart = () => emit('before-drag-start')
      heTreeEmitters.dragend = () => emit('dragend')
      heTreeEmitters.updateModelValue = (nodes: unknown[]) => emit('update:model-value', nodes)
      return () => h('div', {
        'data-test-locator': 'dialogProjectSettings-worldTemplateLayoutTree-stub'
      }, (props.modelValue as unknown[]).map((node) => {
        return slots.default?.({
          node
        })
      }))
    }
  })
  return {
    Draggable,
    dragContext: {
      dragNode: null
    }
  }
})

const baseLayout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
  createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
  {
    templateDisplayName: 'Character',
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    worldAppendix: ''
  }
)

function mountTree (templateLayout = baseLayout): ReturnType<typeof mount> {
  return mount(DialogProjectSettingsWorldTemplateLayoutTree, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      templateLayout
    },
    global: {
      stubs: {
        DialogProjectSettingsWorldTemplateLayoutTreeNode: {
          props: ['node'],
          template: '<div />'
        }
      }
    }
  })
}

/**
 * DialogProjectSettingsWorldTemplateLayoutTree
 * Ignores he-tree model updates when no drag session is active.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTree ignores non-drag model updates', async () => {
  const wrapper = mountTree()
  await flushPromises()
  const priorEmitCount = wrapper.emitted('update:templateLayout')?.length ?? 0
  heTreeEmitters.updateModelValue?.([])
  await flushPromises()
  expect(wrapper.emitted('update:templateLayout')?.length ?? 0).toBe(priorEmitCount)
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTree
 * Commits layout once after after-drop with drag model updates applied.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTree commits once after after-drop', async () => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(performance.now())
    return 1
  })
  const twoTemplateLayout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    appendDialogProjectSettingsWorldTemplatePlacementDraft(
      createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
      {
        templateDisplayName: 'Character',
        documentTemplateId: 'template-a',
        icon: 'mdi-account',
        worldAppendix: ''
      }
    ),
    {
      templateDisplayName: 'Location',
      documentTemplateId: 'template-b',
      icon: 'mdi-map',
      worldAppendix: ''
    }
  )
  const wrapper = mountTree(twoTemplateLayout)
  await flushPromises()
  await nextTick()
  await nextTick()
  heTreeEmitters.beforeDragStart?.()
  const firstPlacement = twoTemplateLayout.placements[0]
  const secondPlacement = twoTemplateLayout.placements[1]
  const treeNodes = [
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: secondPlacement?.documentTemplateId ?? 'template-b',
      icon: 'mdi-map',
      id: secondPlacement?.id ?? 'placement-b',
      label: 'Location',
      nodeKind: 'template',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    },
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: firstPlacement?.documentTemplateId ?? 'template-a',
      icon: 'mdi-account',
      id: firstPlacement?.id ?? 'placement-a',
      label: 'Character',
      nodeKind: 'template',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    }
  ]
  heTreeEmitters.updateModelValue?.(treeNodes)
  heTreeEmitters.afterDrop?.()
  await flushPromises()
  await nextTick()
  await nextTick()
  await flushPromises()
  expect(wrapper.emitted('update:templateLayout')?.length ?? 0).toBe(1)
  heTreeEmitters.afterDrop?.()
  await flushPromises()
  await nextTick()
  await nextTick()
  expect(wrapper.emitted('update:templateLayout')?.length ?? 0).toBe(1)
  vi.unstubAllGlobals()
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTree
 * Cancelled drag via dragend clears session without committing layout changes.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTree skips commit when drag is cancelled', async () => {
  const wrapper = mountTree()
  await flushPromises()
  heTreeEmitters.beforeDragStart?.()
  heTreeEmitters.dragend?.()
  await flushPromises()
  expect(wrapper.emitted('update:templateLayout')).toBeUndefined()
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTree
 * Forwards tree node rename and removal events to parent emits.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTree forwards node events', async () => {
  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTree, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      templateLayout: baseLayout
    },
    global: {
      stubs: {
        DialogProjectSettingsWorldTemplateLayoutTreeNode: defineComponent({
          emits: [
            'deleteGroup',
            'removePlacement',
            'renamePlacementNickname',
            'renameGroup'
          ],
          template: `
            <div>
              <button type="button" data-test-locator="emit-delete-group" @click="$emit('deleteGroup', 'group-a')" />
              <button type="button" data-test-locator="emit-remove-placement" @click="$emit('removePlacement', 'placement-a')" />
              <button type="button" data-test-locator="emit-rename-group" @click="$emit('renameGroup', 'group-a', { 'en-US': 'Group' })" />
              <button
                type="button"
                data-test-locator="emit-rename-placement"
                @click="$emit('renamePlacementNickname', 'placement-a', { plural: { 'en-US': 'Alias' }, singular: {} })"
              />
            </div>
          `
        })
      }
    }
  })

  await flushPromises()

  await wrapper.find('[data-test-locator="emit-delete-group"]').trigger('click')
  expect(wrapper.emitted('deleteGroup')?.[0]).toEqual(['group-a'])

  await wrapper.find('[data-test-locator="emit-remove-placement"]').trigger('click')
  expect(wrapper.emitted('removePlacement')?.[0]).toEqual(['placement-a'])

  await wrapper.find('[data-test-locator="emit-rename-group"]').trigger('click')
  expect(wrapper.emitted('renameGroup')?.[0]).toEqual(['group-a', { 'en-US': 'Group' }])

  await wrapper.find('[data-test-locator="emit-rename-placement"]').trigger('click')
  expect(wrapper.emitted('renamePlacementNickname')?.[0]).toEqual([
    'placement-a',
    {
      plural: { 'en-US': 'Alias' },
      singular: {}
    }
  ])
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTree
 * Exposes draggable and droppable handlers for he-tree bindings.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTree exposes dnd handler bindings', async () => {
  const wrapper = mountTree()
  await flushPromises()

  const tree = wrapper.findComponent({ name: 'DraggableStub' })
  const groupNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: null,
    icon: 'mdi-folder',
    id: 'group-a',
    label: 'Group',
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    nodeKind: 'group' as const,
    templateDisplayName: '',
    usesNickname: false,
    worldAppendix: ''
  }
  const templateNode = {
    ...groupNode,
    documentTemplateId: 'template-a',
    id: 'placement-a',
    nodeKind: 'template' as const
  }

  expect(tree.props('eachDraggable')?.({ data: templateNode })).toBe(true)
  expect(tree.props('eachDroppable')?.({ data: groupNode })).toBe(true)
  expect(tree.props('rootDroppable')?.()).toBe(true)
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTree
 * Forwards layout validation props into each rendered tree node.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTree forwards validation props to tree nodes', async () => {
  const capturedNodeProps: Record<string, unknown>[] = []

  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTree, {
    props: {
      blankGroupIds: new Set(['blank-group']),
      currentLanguageCode: 'de',
      documentTemplates: [],
      duplicateDocumentTemplateIds: new Set(['template-a']),
      invalidDocumentTemplateIds: new Set(['template-b']),
      templateLayout: baseLayout
    },
    global: {
      stubs: {
        DialogProjectSettingsWorldTemplateLayoutTreeNode: defineComponent({
          name: 'DialogProjectSettingsWorldTemplateLayoutTreeNode',
          props: [
            'blankGroupIds',
            'currentLanguageCode',
            'documentTemplates',
            'duplicateDocumentTemplateIds',
            'invalidDocumentTemplateIds',
            'node'
          ],
          setup (props) {
            capturedNodeProps.push({ ...props })
            return () => h('div', { 'data-test-locator': 'tree-node-props-capture' })
          }
        })
      }
    }
  })

  await flushPromises()

  expect(capturedNodeProps.length).toBeGreaterThan(0)
  expect(capturedNodeProps[0]?.currentLanguageCode).toBe('de')
  expect(capturedNodeProps[0]?.blankGroupIds).toEqual(new Set(['blank-group']))
  expect(wrapper.find('[data-test-locator="tree-node-props-capture"]').exists()).toBe(true)
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTree
 * Scrolls the tree when a new layout node is appended.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTree scrolls when layout nodes append', async () => {
  const scrollIntoView = vi.fn()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const frameTime = 0
    callback(frameTime)
    return 1
  })

  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTree, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      templateLayout: layout
    },
    global: {
      stubs: {
        DialogProjectSettingsWorldTemplateLayoutTreeNode: defineComponent({
          mounted (): void {
            this.$el.scrollIntoView = scrollIntoView
          },
          template: '<div class="tree-node dialogProjectSettingsWorldTemplateLayoutTreeNode" />'
        })
      }
    }
  })

  await flushPromises()

  const nextLayout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    templateDisplayName: 'Character',
    worldAppendix: ''
  })

  await wrapper.setProps({ templateLayout: nextLayout })
  await flushPromises()

  expect(scrollIntoView).toHaveBeenCalled()
  vi.unstubAllGlobals()
})
