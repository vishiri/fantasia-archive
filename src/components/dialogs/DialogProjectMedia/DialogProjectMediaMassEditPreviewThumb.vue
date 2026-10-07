<template>
  <div
    class="dialogProjectMediaMassEditPreviewThumb"
    :class="{
      'dialogProjectMediaMassEditPreviewThumb--list': thumbSize === 'list',
      'dialogProjectMediaMassEditPreviewThumb--previewError': showWarning,
      'dialogProjectMediaMassEditPreviewThumb--previewGlyph': showPreviewGlyph,
      'dialogProjectMediaMassEditPreviewThumb--singleEdit': isSingleEdit,
      'dialogProjectMediaMassEditPreviewThumb--singleEditAudio': showSingleEditAudio,
      'dialogProjectMediaMassEditPreviewThumb--singleEditEmbed': isSingleEditEmbed
    }"
    :data-test-locator="`${locatorPrefix}-${rowId}`"
  >
    <!-- Missing file / invalid URL -->
    <q-icon
      v-if="showWarning"
      class="dialogProjectMediaMassEditPreviewThumb__warning fa-color-glyph"
      color="warning"
      :data-test-locator="`${locatorPrefix}Warning-${rowId}`"
      :data-test-tooltip-text="warningTooltip"
      name="warning"
    />
    <q-tooltip v-if="showWarning">
      {{ warningTooltip }}
    </q-tooltip>
    <!-- Video / audio / embed success glyph (mass-edit and list) -->
    <q-icon
      v-if="showGlyphTypeIcon"
      class="dialogProjectMediaMassEditPreviewThumb__typeIcon fa-color-glyph"
      color="accent"
      :data-test-locator="`${locatorPrefix}TypeIcon-${rowId}`"
      :name="typeIconName"
    />
    <!-- Image bitmap; hidden until load -->
    <img
      v-if="showImage"
      :key="probeSrc"
      class="dialogProjectMediaMassEditPreviewThumb__image"
      :class="{
        'dialogProjectMediaMassEditPreviewThumb__image--pending': pending
      }"
      :alt="alt"
      :data-test-locator="`${locatorPrefix}Image-${rowId}`"
      :src="probeSrc"
      @error="emit('error')"
      @load="emit('load')"
    >
    <!-- Video: hidden probe, or single-edit player -->
    <video
      v-if="showVideoEl"
      :key="probeSrc"
      :class="videoClassName"
      :controls="showSingleEditVideoPlayer"
      :data-test-locator="`${locatorPrefix}Video-${rowId}`"
      preload="metadata"
      :src="probeSrc"
      @error="emit('error')"
      @loadedmetadata="emit('load')"
    />
    <!-- Audio: hidden probe, or single-edit player -->
    <audio
      v-if="showAudioEl"
      :key="probeSrc"
      ref="audioPlayerEl"
      :class="audioClassName"
      :controls="showSingleEditAudio"
      :data-test-locator="`${locatorPrefix}Audio-${rowId}`"
      :preload="audioPreload"
      :src="probeSrc"
      @error="emit('error')"
      @loadedmetadata="onAudioLoadedMetadata"
    />
    <!-- Single-edit embed: raw HTML from External embed body -->
    <!-- eslint-disable vue/no-v-html -- User-authored External embed body for this project. -->
    <div
      v-if="isSingleEditEmbed"
      class="dialogProjectMediaMassEditPreviewThumb__embed"
      :data-test-locator="`${locatorPrefix}Embed-${rowId}`"
      v-html="embedHtmlBound"
    />
    <!-- eslint-enable vue/no-v-html -->
    <!-- Filename overlay (list) -->
    <div
      v-if="caption.length > 0"
      class="dialogProjectMediaMassEditPreviewThumb__caption"
      :data-test-locator="`${locatorPrefix}Caption-${rowId}`"
    >
      <span class="dialogProjectMediaMassEditPreviewThumb__captionText">{{ caption }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { T_faProjectMediaPreviewThumbSize } from 'app/types/I_faProjectMediaDomain'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import {
  FA_PROJECT_MEDIA_AUDIO_CONTROLS_RELAYOUT_MS,
  relayoutFaProjectMediaAudioControls
} from 'app/src/scripts/faProjectMedia/faProjectMedia_manager'

defineOptions({
  name: 'DialogProjectMediaMassEditPreviewThumb'
})

const props = withDefaults(defineProps<{
  alt: string
  caption?: string
  embedHtml?: string
  locatorPrefix?: string
  pending: boolean
  probeSrc: string
  rowId: string
  showAudio: boolean
  showImage: boolean
  showTypeIcon: boolean
  showVideo: boolean
  showWarning: boolean
  thumbSize?: T_faProjectMediaPreviewThumbSize
  typeIconName: string
  warningTooltip: string
}>(), {
  caption: '',
  embedHtml: '',
  locatorPrefix: 'dialogProjectMedia-massEdit-preview',
  thumbSize: 'massEdit'
})

const caption = computed(() => props.caption ?? '')
const embedHtmlBound = computed(() => props.embedHtml ?? '')
const locatorPrefix = computed(() => {
  return props.locatorPrefix ?? 'dialogProjectMedia-massEdit-preview'
})
const thumbSize = computed(() => props.thumbSize ?? 'massEdit')
const isSingleEdit = computed(() => thumbSize.value === 'singleEdit')
const isSingleEditEmbed = computed(() => {
  return isSingleEdit.value &&
    embedHtmlBound.value.trim().length > 0 &&
    !props.showWarning
})
const showGlyphTypeIcon = computed(() => {
  return props.showTypeIcon && !isSingleEdit.value
})
const showSingleEditVideoPlayer = computed(() => {
  return isSingleEdit.value && props.showVideo && !props.showWarning
})
const showSingleEditAudio = computed(() => {
  return isSingleEdit.value && props.showAudio && !props.showWarning
})
const audioPreload = computed(() => {
  if (isSingleEdit.value) {
    return 'auto'
  }
  return 'metadata'
})
const showPreviewGlyph = computed(() => {
  return props.showWarning || showGlyphTypeIcon.value
})
const showVideoEl = computed(() => props.showVideo)
const showAudioEl = computed(() => props.showAudio)
const videoClassName = computed(() => {
  if (showSingleEditVideoPlayer.value) {
    return 'dialogProjectMediaMassEditPreviewThumb__videoPlayer'
  }
  return 'dialogProjectMediaMassEditPreviewThumb__mediaProbe'
})
const audioClassName = computed(() => {
  if (showSingleEditAudio.value) {
    return 'dialogProjectMediaMassEditPreviewThumb__audioPlayer'
  }
  return 'dialogProjectMediaMassEditPreviewThumb__mediaProbe'
})

const emit = defineEmits<{
  error: []
  load: []
}>()

const audioPlayerEl = ref<HTMLAudioElement | null>(null)
let audioRelayoutTimer: ReturnType<typeof setTimeout> | undefined

function relayoutSingleEditAudioControls (): void {
  if (!showSingleEditAudio.value) {
    return
  }
  relayoutFaProjectMediaAudioControls(audioPlayerEl.value)
}

function onAudioLoadedMetadata (): void {
  emit('load')
  relayoutSingleEditAudioControls()
}

watch(showSingleEditAudio, (shown) => {
  clearTimeout(audioRelayoutTimer)
  audioRelayoutTimer = undefined
  if (!shown) {
    return
  }
  void nextTick(() => {
    relayoutSingleEditAudioControls()
  })
  audioRelayoutTimer = setTimeout(() => {
    relayoutSingleEditAudioControls()
  }, FA_PROJECT_MEDIA_AUDIO_CONTROLS_RELAYOUT_MS)
}, {
  immediate: true
})

onBeforeUnmount(() => {
  clearTimeout(audioRelayoutTimer)
})
</script>

<style lang="scss" scoped src="./styles/DialogProjectMedia.massEditPreviewThumb.scoped.scss"></style>
