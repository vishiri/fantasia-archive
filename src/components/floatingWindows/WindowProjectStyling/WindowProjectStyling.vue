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
        class="floatingWindowComponent windowProjectStyling"
        :class="['floatingWindowComponent', documentName]"
        :style="frameStyleWithDialogTransition"
        aria-labelledby="windowProjectStyling-title"
        data-test-locator="windowProjectStyling-frame"
        @pointerdown.self="onFramePointerDown"
      >
        <FaFloatingWindowFrameResizeHandles :on-resize-pointer-down="onResizePointerDown" />
        <q-card class="windowProjectStyling__card floatingWindowComponent__surface">
          <div
            class="windowProjectStyling__titleRow"
            data-test-locator="windowProjectStyling-dragHandle"
            @pointerdown="onTitlePointerDown"
          >
            <h5
              id="windowProjectStyling-title"
              :class="[
                'text-center',
                'text-h5',
                'floatingWindowComponent__title',
                'windowProjectStyling__title',
                titleShortFrameClass
              ]"
              data-test-locator="windowProjectStyling-title"
            >
              {{ $t('floatingWindows.projectStyling.title') }}
            </h5>
          </div>

          <q-card-section class="q-pa-none windowProjectStyling__body">
            <q-icon
              name="mdi-help-circle"
              size="23px"
              class="windowProjectStyling__helpIcon"
              role="img"
              color="primary-bright"
              :aria-label="$t('floatingWindows.projectStyling.helpTooltip.aria')"
              data-test-locator="windowProjectStyling-helpIcon"
              @mouseenter="onHelpIconMouseEnter"
              @mouseleave="onHelpIconMouseLeave"
            >
              <q-menu
                v-model="helpKeybindMenuOpen"
                anchor="bottom right"
                class="windowProjectStyling__helpTooltip"
                data-test-locator="windowProjectStyling-helpMenu"
                :dark="false"
                :offset="[0, 10]"
                self="top right"
                no-focus
                :transition-duration="300"
              >
                <div
                  class="windowProjectStyling__helpTooltipBody"
                  data-test-locator="windowProjectStyling-helpTooltipBody"
                >
                  <div class="windowProjectStyling__helpTooltipKeybinds">
                    <strong class="windowProjectStyling__helpTooltipTitle">
                      {{ $t('floatingWindows.projectStyling.helpTooltip.title') }}
                    </strong>
                    <ul class="windowProjectStyling__helpTooltipList">
                      <li
                        v-for="item in monacoKeybindHelpItems"
                        :key="item.labelKey"
                        class="windowProjectStyling__helpTooltipItem"
                      >
                        <span class="windowProjectStyling__helpTooltipChord">{{ item.chord }}</span>
                        <span class="windowProjectStyling__helpTooltipLabel">
                          {{
                            $t(`floatingWindows.projectStyling.helpTooltip.items.${item.labelKey}`)
                          }}
                        </span>
                      </li>
                    </ul>
                    <p class="windowProjectStyling__helpTooltipFooter">
                      {{ $t('floatingWindows.projectStyling.helpTooltip.footer') }}
                    </p>
                  </div>
                  <q-separator
                    class="fa-separator-grey-lighter"
                    inset
                    vertical
                  />
                  <div class="windowProjectStyling__helpTooltipVariableList">
                    <strong class="windowProjectStyling__helpTooltipTitle">
                      {{ $t('floatingWindows.projectStyling.helpTooltip.variableListTitle') }}
                    </strong>
                    <ul
                      class="windowProjectStyling__helpTooltipFaVarList hasScrollbar"
                      data-test-locator="windowProjectStyling-faThemeVarList"
                    >
                      <li
                        v-for="name in faThemeCustomPropertyNames"
                        :key="name"
                        class="windowProjectStyling__helpTooltipFaVarItem"
                        :data-test-fa-theme-var="name"
                      >
                        <span
                          class="windowProjectStyling__helpTooltipFaVarSwatch"
                          :style="buildFaColorVarSwatchStyle(name)"
                          aria-hidden="true"
                          :data-test-fa-theme-var-swatch="name"
                        />
                        <span class="windowProjectStyling__helpTooltipFaVarName">{{ name }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </q-menu>
            </q-icon>
            <div
              ref="editorHostRef"
              class="windowProjectStyling__editorHost"
              data-test-locator="windowProjectStyling-editorHost"
            />

            <div
              v-if="monaco.isLoading.value"
              class="windowProjectStyling__loadingOverlay"
              data-test-locator="windowProjectStyling-loadingOverlay"
            >
              <q-spinner-dots
                color="primary-bright"
                size="48px"
              />
              <span class="q-ml-md">{{ $t('floatingWindows.projectStyling.loading') }}</span>
            </div>

            <div
              v-if="monaco.loadError.value !== null"
              class="windowProjectStyling__loadError text-negative"
              data-test-locator="windowProjectStyling-loadError"
            >
              {{ monaco.loadError.value }}
            </div>
          </q-card-section>

          <q-card-actions
            align="right"
            class="q-mb-sm q-mt-none q-px-md q-gutter-sm windowProjectStyling__cardActions"
          >
            <q-btn
              flat
              color="accent"
              class="q-mr-xl"
              :label="$t('floatingWindows.projectStyling.closeWithoutSaving')"
              data-test-locator="windowProjectStyling-button-close"
              @click="closeWithoutSaving"
            />
            <q-btn
              color="primary-bright"
              outline
              :label="$t('floatingWindows.projectStyling.saveButton')"
              data-test-locator="windowProjectStyling-button-save"
              @click="saveAndCloseWindow"
            />
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
import { useWindowProjectStylingSurface } from 'app/src/components/floatingWindows/WindowProjectStyling/scripts/windowProjectStyling_manager'

defineOptions({
  name: 'WindowProjectStyling'
})

const props = defineProps<{
  /**
   * Storybook / Playwright harness: opens when already set to WindowProjectStyling during setup.
   */
  directInput?: T_dialogName
}>()

const {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  buildFaColorVarSwatchStyle,
  closeWithoutSaving,
  documentName,
  editorHostRef,
  faThemeCustomPropertyNames,
  frameRef,
  frameStyleWithDialogTransition,
  helpKeybindMenuOpen,
  monaco,
  monacoKeybindHelpItems,
  onFramePointerDown,
  onHelpIconMouseEnter,
  onHelpIconMouseLeave,
  onResizePointerDown,
  onTitlePointerDown,
  saveAndCloseWindow,
  titleShortFrameClass,
  windowModel
} = useWindowProjectStylingSurface(props)
</script>

<style lang="scss" src="./styles/WindowProjectStyling.unscoped.scss"></style>
