<template>
  <div class="dialogProjectSettings__worldsPanel row no-wrap">
    <DialogProjectSettingsWorldsTabList
      :selected-world-id="selectedWorldId"
      :worlds="props.worlds"
      @add-world="emit('addWorld')"
      @select="onSelectWorld"
      @update:worlds="emit('update:worlds', $event)"
    />

    <q-separator vertical />

    <div class="dialogProjectSettings__worldsDetailHost col">
      <DialogProjectSettingsWorldsDetailPanel
        v-if="selectedWorld !== null"
        :name-has-error="isWorldNameInvalid(selectedWorld.displayName)"
        :remove-disabled="isWorldRemoveDisabled(selectedWorld)"
        :remove-disabled-reason="resolveRemoveDisabledReason(selectedWorld)"
        :world="selectedWorld"
        @remove="emitRemove(selectedWorld.id)"
        @update:color="emitUpdateColor(selectedWorld.id, $event)"
        @update:color-pallete="emitUpdateColorPallete(selectedWorld.id, $event)"
        @update:display-name="emitUpdateDisplayName(selectedWorld.id, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import {
  isDialogProjectSettingsWorldNameInvalid,
  isDialogProjectSettingsWorldRemoveDisabled
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldsDraft'
import { resolveDialogProjectSettingsWorldsPanelSelection } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldsSelection'
import DialogProjectSettingsWorldsDetailPanel from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsWorldsDetailPanel.vue'
import DialogProjectSettingsWorldsTabList from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsWorldsTabList.vue'

defineOptions({
  name: 'DialogProjectSettingsWorldsPanel'
})

const props = defineProps<{
  worlds: I_dialogProjectSettingsWorldDraft[]
}>()

const emit = defineEmits<{
  addWorld: []
  removeWorld: [id: string]
  'update:worlds': [worlds: I_dialogProjectSettingsWorldDraft[]]
  updateWorldColor: [id: string, color: string]
  updateWorldColorPallete: [id: string, colorPallete: string]
  updateWorldDisplayName: [id: string, displayName: string]
}>()

const selectedWorldId = ref<string | null>(null)
const previousWorlds = ref<I_dialogProjectSettingsWorldDraft[]>([])

const selectedWorld = computed(() => {
  if (selectedWorldId.value === null) {
    return null
  }
  return props.worlds.find((world) => world.id === selectedWorldId.value) ?? null
})

watch(() => props.worlds, (nextWorlds) => {
  selectedWorldId.value = resolveDialogProjectSettingsWorldsPanelSelection(
    nextWorlds,
    previousWorlds.value,
    selectedWorldId.value
  )
  previousWorlds.value = nextWorlds.map((world) => ({ ...world }))
}, {
  immediate: true
})

function isWorldNameInvalid (displayName: string): boolean {
  return isDialogProjectSettingsWorldNameInvalid(displayName)
}

function isWorldRemoveDisabled (world: I_dialogProjectSettingsWorldDraft): boolean {
  return isDialogProjectSettingsWorldRemoveDisabled(props.worlds, world)
}

function resolveRemoveDisabledReason (
  world: I_dialogProjectSettingsWorldDraft
): 'hasDocuments' | 'lastWorld' | null {
  if (!isWorldRemoveDisabled(world)) {
    return null
  }
  if (world.documentCount > 0) {
    return 'hasDocuments'
  }
  return 'lastWorld'
}

function onSelectWorld (id: string): void {
  selectedWorldId.value = id
}

function emitRemove (id: string): void {
  emit('removeWorld', id)
}

function emitUpdateDisplayName (id: string, displayName: string): void {
  emit('updateWorldDisplayName', id, displayName)
}

function emitUpdateColor (id: string, color: string): void {
  emit('updateWorldColor', id, color)
}

function emitUpdateColorPallete (id: string, colorPallete: string): void {
  emit('updateWorldColorPallete', id, colorPallete)
}
</script>

<style lang="scss" scoped>
.dialogProjectSettings__worldsPanel {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.dialogProjectSettings__worldsDetailHost {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden auto;
}
</style>
