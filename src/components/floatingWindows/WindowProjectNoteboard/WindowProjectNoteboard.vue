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
        class="floatingWindowComponent windowProjectNoteboard"
        :class="['floatingWindowComponent', documentNameClass]"
        :style="frameStyleWithDialogTransition"
        aria-labelledby="windowProjectNoteboard-title"
        data-test-locator="windowProjectNoteboard-frame"
        @pointerdown.self="onFramePointerDown"
      >
        <FaFloatingWindowFrameResizeHandles :on-resize-pointer-down="onResizePointerDown" />
        <q-card class="windowProjectNoteboard__card floatingWindowComponent__surface">
          <div
            class="windowProjectNoteboard__titleRow"
            data-test-locator="windowProjectNoteboard-dragHandle"
            @pointerdown="onTitlePointerDown"
          >
            <h5
              id="windowProjectNoteboard-title"
              :class="[
                'text-center',
                'text-h5',
                'floatingWindowComponent__title',
                'windowProjectNoteboard__title',
                titleShortFrameClass
              ]"
              data-test-locator="windowProjectNoteboard-title"
            >
              {{ $t('floatingWindows.projectNoteboard.title') }}
            </h5>
          </div>

          <q-card-section class="q-pa-md windowProjectNoteboard__body">
            <textarea
              v-model="text"
              class="windowProjectNoteboard__textarea hasScrollbar"
              :aria-label="$t('floatingWindows.projectNoteboard.editorAria')"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              data-gramm="false"
              data-test-locator="windowProjectNoteboard-editor"
              :spellcheck="false"
            />
          </q-card-section>

          <q-card-actions
            align="center"
            class="q-mb-sm q-mt-none q-px-md q-gutter-sm windowProjectNoteboard__cardActions"
          >
            <q-btn
              flat
              color="accent"
              class="windowProjectNoteboard__closeBtn"
              data-test-locator="windowProjectNoteboard-button-close"
              @click="onClose"
            >
              <div class="windowProjectNoteboard__closeBtn-stack">
                <span class="windowProjectNoteboard__closeBtn-label">
                  {{ $t('floatingWindows.projectNoteboard.close') }}
                </span><div
                  v-if="noteboardToggleKeybindLabel !== null"
                  class="windowProjectNoteboard__closeBtn-keybind fa-text-keybind-hint"
                  data-test-locator="windowProjectNoteboard-button-close-keybind"
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
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import FaFloatingWindowBodyTeleport from 'app/src/components/floatingWindows/_FaFloatingWindowBodyTeleport/_FaFloatingWindowBodyTeleport.vue'
import FaFloatingWindowFrameResizeHandles from 'app/src/components/floatingWindows/_FaFloatingWindowFrameResizeHandles/_FaFloatingWindowFrameResizeHandles.vue'
import { useWindowProjectNoteboard } from 'app/src/components/floatingWindows/WindowProjectNoteboard/scripts/windowProjectNoteboard_manager'

defineOptions({
  name: 'WindowProjectNoteboard'
})

const props = defineProps<{
  /**
   * Storybook / harness: open without the menu action when set to 'WindowProjectNoteboard'.
   */
  directInput?: T_dialogName | undefined
}>()

const {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  documentNameClass,
  frameRef,
  frameStyleWithDialogTransition,
  noteboardToggleKeybindLabel,
  onClose,
  onFramePointerDown,
  onResizePointerDown,
  onTitlePointerDown,
  text,
  titleShortFrameClass,
  windowModel
} = useWindowProjectNoteboard(props)
</script>

<style lang="scss" src="./styles/WindowProjectNoteboard.unscoped.scss"></style>
