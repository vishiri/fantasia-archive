import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import { createProjectHierarchyTreeSettingsSurfaceWiring } from '../projectHierarchyTreeSettingsSurfaceWiring'

const sampleWorlds = ref([
  {
    color: '#ff0000',
    colorPallete: '',
    displayName: 'World A',
    groups: [],
    id: 'world-1',
    placements: [],
    sortOrder: 0
  },
  {
    color: '#00ff00',
    colorPallete: '',
    displayName: 'World B',
    groups: [],
    id: 'world-2',
    placements: [],
    sortOrder: 1
  }
])

test('Test that createProjectHierarchyTreeSettingsSurfaceWiring composes display bindings', () => {
  const settings = ref({
    hideTreeOrderNumbers: false,
    noProjectName: false
  })
  const appSettingsDialogPreview = ref<null | { noProjectName?: boolean }>(null)
  const activeProject = ref({
    name: 'Multi-world project'
  })

  const wiring = createProjectHierarchyTreeSettingsSurfaceWiring({
    S_FaActiveProject: (() => ({})) as never,
    S_FaUserSettings: (() => ({})) as never,
    computed,
    runFaAction: vi.fn(),
    storeToRefs: () => ({
      activeProject,
      appSettingsDialogPreview,
      settings
    }) as never,
    worlds: sampleWorlds
  })

  expect(wiring.projectNameTitleWiring.projectDisplayName.value).toBe('Multi-world project')
  expect(wiring.projectNameTitleWiring.showsProjectNameTitle.value).toBe(true)
  expect(wiring.nodeDisplayBindings.resolveOrderNumberBadgeLabelForNode).toBeTypeOf('function')
  expect(wiring.documentButtonGroupWiring).toBeTruthy()
  expect(wiring.treeLineWiring).toBeTruthy()
})
