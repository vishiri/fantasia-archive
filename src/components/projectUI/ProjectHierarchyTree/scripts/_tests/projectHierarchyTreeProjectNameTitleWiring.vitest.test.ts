import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import { createProjectHierarchyTreeProjectNameTitleWiring } from '../projectHierarchyTreeProjectNameTitleWiring'

test('createProjectHierarchyTreeProjectNameTitleWiring shows multi-world project name', () => {
  const activeProject = ref({
    name: 'FA, Ralia, Age of Magic Reborn'
  })
  const settings = ref({
    noProjectName: false
  })
  const appSettingsDialogPreview = ref<null | { noProjectName?: boolean }>(null)
  const worldCount = computed(() => 2)

  const wiring = createProjectHierarchyTreeProjectNameTitleWiring({
    S_FaActiveProject: (() => ({})) as never,
    S_FaUserSettings: (() => ({})) as never,
    computed,
    storeToRefs: () => ({
      activeProject,
      appSettingsDialogPreview,
      settings
    }) as never,
    worldCount
  })

  expect(wiring.projectDisplayName.value).toBe('FA, Ralia, Age of Magic Reborn')
  expect(wiring.showsProjectNameTitle.value).toBe(true)
})

test('createProjectHierarchyTreeProjectNameTitleWiring hides when noProjectName preview is on', () => {
  const activeProject = ref({
    name: 'Multi World Project'
  })
  const settings = ref({
    noProjectName: false
  })
  const appSettingsDialogPreview = ref<{ noProjectName?: boolean } | null>({
    noProjectName: true
  })
  const worldCount = computed(() => 3)

  const wiring = createProjectHierarchyTreeProjectNameTitleWiring({
    S_FaActiveProject: (() => ({})) as never,
    S_FaUserSettings: (() => ({})) as never,
    computed,
    storeToRefs: () => ({
      activeProject,
      appSettingsDialogPreview,
      settings
    }) as never,
    worldCount
  })

  expect(wiring.showsProjectNameTitle.value).toBe(false)
})

test('createProjectHierarchyTreeProjectNameTitleWiring hides for single-world projects', () => {
  const activeProject = ref({
    name: 'Single World'
  })
  const settings = ref({
    noProjectName: false
  })
  const appSettingsDialogPreview = ref<null | { noProjectName?: boolean }>(null)
  const worldCount = computed(() => 1)

  const wiring = createProjectHierarchyTreeProjectNameTitleWiring({
    S_FaActiveProject: (() => ({})) as never,
    S_FaUserSettings: (() => ({})) as never,
    computed,
    storeToRefs: () => ({
      activeProject,
      appSettingsDialogPreview,
      settings
    }) as never,
    worldCount
  })

  expect(wiring.showsProjectNameTitle.value).toBe(false)
})

test('createProjectHierarchyTreeProjectNameTitleWiring hides when noProjectName setting is enabled', () => {
  const activeProject = ref({
    name: 'Multi World Project'
  })
  const settings = ref({
    noProjectName: true
  })
  const appSettingsDialogPreview = ref<null | { noProjectName?: boolean }>(null)
  const worldCount = computed(() => 2)

  const wiring = createProjectHierarchyTreeProjectNameTitleWiring({
    S_FaActiveProject: (() => ({})) as never,
    S_FaUserSettings: (() => ({})) as never,
    computed,
    storeToRefs: () => ({
      activeProject,
      appSettingsDialogPreview,
      settings
    }) as never,
    worldCount
  })

  expect(wiring.showsProjectNameTitle.value).toBe(false)
})

test('createProjectHierarchyTreeProjectNameTitleWiring defaults empty project name when active project missing', () => {
  const activeProject = ref<null | { name: string }>(null)
  const settings = ref({
    noProjectName: false
  })
  const appSettingsDialogPreview = ref<null | { noProjectName?: boolean }>(null)
  const worldCount = computed(() => 2)

  const wiring = createProjectHierarchyTreeProjectNameTitleWiring({
    S_FaActiveProject: (() => ({})) as never,
    S_FaUserSettings: (() => ({})) as never,
    computed,
    storeToRefs: () => ({
      activeProject,
      appSettingsDialogPreview,
      settings
    }) as never,
    worldCount
  })

  expect(wiring.projectDisplayName.value).toBe('')
  expect(wiring.showsProjectNameTitle.value).toBe(false)
})
