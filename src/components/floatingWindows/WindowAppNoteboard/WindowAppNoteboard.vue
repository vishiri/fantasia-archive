<template>
  <!-- Transition must wrap a single element root; Teleport cannot be the direct child of Transition. -->
  <FaFloatingWindowBodyTeleport>
    <Transition
      v-bind="FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS"
      :duration="FA_FLOATING_WINDOW_POP_TRANSITION_MS"
    >
      <div
        v-if="windowModel"
        ref="frameRef"
        class="floatingWindowComponent windowAppNoteboard"
        :class="['floatingWindowComponent', documentNameClass]"
        :style="frameStyleWithDialogTransition"
        aria-labelledby="windowAppNoteboard-title"
        data-test-locator="windowAppNoteboard-frame"
        @pointerdown.self="onFramePointerDown"
      >
        <FaFloatingWindowFrameResizeHandles :on-resize-pointer-down="onResizePointerDown" />
        <q-card class="windowAppNoteboard__card floatingWindowComponent__surface">
          <div
            class="windowAppNoteboard__titleRow"
            data-test-locator="windowAppNoteboard-dragHandle"
            @pointerdown="onTitlePointerDown"
          >
            <h5
              id="windowAppNoteboard-title"
              :class="[
                'text-center',
                'text-h5',
                'floatingWindowComponent__title',
                'windowAppNoteboard__title',
                titleShortFrameClass
              ]"
              data-test-locator="windowAppNoteboard-title"
            >
              {{ $t('floatingWindows.appNoteboard.title') }}
            </h5>
          </div>

          <q-card-section class="q-pa-md windowAppNoteboard__body">
            <textarea
              v-model="text"
              class="windowAppNoteboard__textarea hasScrollbar"
              :aria-label="$t('floatingWindows.appNoteboard.editorAria')"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              data-gramm="false"
              data-test-locator="windowAppNoteboard-editor"
              :spellcheck="false"
            />
          </q-card-section>

          <q-card-actions
            align="center"
            class="q-mb-sm q-mt-none q-px-md q-gutter-sm windowAppNoteboard__cardActions"
          >
            <q-btn
              flat
              color="accent"
              class="windowAppNoteboard__closeBtn"
              data-test-locator="windowAppNoteboard-button-close"
              @click="onClose"
            >
              <div class="windowAppNoteboard__closeBtn-stack">
                <span class="windowAppNoteboard__closeBtn-label">
                  {{ $t('floatingWindows.appNoteboard.close') }}
                </span><div
                  v-if="noteboardToggleKeybindLabel !== null"
                  class="windowAppNoteboard__closeBtn-keybind fa-text-keybind-hint"
                  data-test-locator="windowAppNoteboard-button-close-keybind"
                >
                  ({{ noteboardToggleKeybindLabel }})
                </div>
              </div>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </Transition>
  </FaFloatingWindowBodyTeleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import FaFloatingWindowBodyTeleport from 'app/src/components/floatingWindows/_FaFloatingWindowBodyTeleport/_FaFloatingWindowBodyTeleport.vue'
import FaFloatingWindowFrameResizeHandles from 'app/src/components/floatingWindows/_FaFloatingWindowFrameResizeHandles/_FaFloatingWindowFrameResizeHandles.vue'
import { useWindowAppNoteboardFramePersist } from 'app/src/components/floatingWindows/WindowAppNoteboard/scripts/useWindowAppNoteboardFramePersist'
import { useWindowAppNoteboardTextPersist } from 'app/src/components/floatingWindows/WindowAppNoteboard/scripts/useWindowAppNoteboardTextPersist'
import { wireWindowAppNoteboardDirectInput } from 'app/src/components/floatingWindows/WindowAppNoteboard/scripts/wireWindowAppNoteboardDirectInput'
import {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS
} from 'app/src/scripts/floatingWindows/faFloatingWindowPopTransition'
import { useFaFloatingWindowFrame } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFrame'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

defineOptions({
  name: 'WindowAppNoteboard'
})

const props = defineProps<{
  /**
   * Storybook / harness: open without the menu action when set to 'WindowAppNoteboard'.
   */
  directInput?: T_dialogName
}>()

const noteboardStore = S_FaAppNoteboard()
const faKeybindsStore = S_FaKeybinds()

const noteboardToggleKeybindLabel = computed((): string | null => {
  return formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'toggleAppNoteboard',
    snapshot: faKeybindsStore.snapshot
  })
})

const {
  isWindowOpen: windowModel,
  root: noteboardRoot,
  text
} = storeToRefs(noteboardStore)

const documentNameClass = 'WindowAppNoteboard'

const persistedNoteboardFrame = computed(() => noteboardRoot.value?.frame ?? null)

const {
  frameRef,
  frameStyle,
  h,
  onFramePointerDown,
  onResizePointerDown,
  onTitlePointerDown,
  titleShortFrameClass,
  w,
  x,
  y
} = useFaFloatingWindowFrame(windowModel, undefined, {
  floatingWindowZLayer: 'noteboard',
  persistedFrame: persistedNoteboardFrame
})

useWindowAppNoteboardFramePersist({
  h,
  w,
  windowModel,
  x,
  y
})

useWindowAppNoteboardTextPersist({
  text,
  windowModel
})

wireWindowAppNoteboardDirectInput(props)

const frameStyleWithDialogTransition = computed(() => ({
  ...frameStyle.value,
  '--q-transition-duration': `${FA_FLOATING_WINDOW_POP_TRANSITION_MS}ms`
}))

function onClose (): void {
  noteboardStore.setWindowOpen(false)
}
</script>

<style lang="scss" src="./styles/WindowAppNoteboard.unscoped.scss"></style>
