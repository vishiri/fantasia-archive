import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import type { I_dialogKeybindSettingsRow } from 'app/types/I_dialogKeybindSettings'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

function dialogKeybindSettingsFilterTrimmed (
  filter: I_ref<string | null | undefined>
): string {
  const v = filter.value
  return typeof v === 'string' ? v.trim() : ''
}

export function createDialogKeybindSettingsTable (deps: {
  buildDialogKeybindSettingsRows: (params: {
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
    t: (key: string) => string
  }) => I_dialogKeybindSettingsRow[]
  buildDialogKeybindSettingsTableColumns: (t: (key: string) => string) => Array<{
    align: 'left'
    classes: string
    field: string
    label: string
    name: string
  }>
  computed: <T>(getter: () => T) => I_computedRef<T>
}): {
    createDialogKeybindSettingsTableState: (params: {
      filter: I_ref<string | null | undefined>
      platform: I_computedRef<NodeJS.Platform>
      t: (key: string) => string
      workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
    }) => {
      tableColumns: I_computedRef<Array<{
        align: 'left'
        classes: string
        field: string
        label: string
        name: string
      }>>
      tableRows: I_computedRef<I_dialogKeybindSettingsRow[]>
    }
  } {
  function createDialogKeybindSettingsTableState (params: {
    filter: I_ref<string | null | undefined>
    platform: I_computedRef<NodeJS.Platform>
    t: (key: string) => string
    workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
  }): {
      tableColumns: I_computedRef<Array<{
        align: 'left'
        classes: string
        field: string
        label: string
        name: string
      }>>
      tableRows: I_computedRef<I_dialogKeybindSettingsRow[]>
    } {
    const {
      filter,
      platform,
      t,
      workingOverrides
    } = params

    const tableRows = deps.computed((): I_dialogKeybindSettingsRow[] => {
      const built = deps.buildDialogKeybindSettingsRows({
        overrides: workingOverrides.value,
        platform: platform.value,
        t: (k: string) => t(k)
      })
      const q = dialogKeybindSettingsFilterTrimmed(filter).toLowerCase()
      if (q.length === 0) {
        return built
      }
      return built.filter((r) => r.nameLabel.toLowerCase().includes(q))
    })

    const tableColumns = deps.computed(() => {
      return deps.buildDialogKeybindSettingsTableColumns(t)
    })

    return {
      tableColumns,
      tableRows
    }
  }

  return {
    createDialogKeybindSettingsTableState
  }
}
