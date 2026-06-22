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
