import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import { FA_PROJECT_MEDIA_AUDIO_CONTROLS_RELAYOUT_MS } from 'app/src/scripts/faProjectMedia/faProjectMedia_manager'

import DialogProjectMediaMassEditPreviewThumb from '../DialogProjectMediaMassEditPreviewThumb.vue'

const thumbGlobal = {
  stubs: {
    QIcon: {
      inheritAttrs: true,
      template: '<i v-bind="$attrs" />'
    },
    QTooltip: {
      template: '<span><slot /></span>'
    }
  }
} as const

function mountThumb (props: {
  embedHtml?: string
  pending?: boolean
  probeSrc?: string
  showAudio?: boolean
  showImage?: boolean
  showTypeIcon?: boolean
  showVideo?: boolean
  showWarning?: boolean
  thumbSize?: 'list' | 'massEdit' | 'singleEdit'
  typeIconName?: string
}) {
  return mount(DialogProjectMediaMassEditPreviewThumb, {
    global: thumbGlobal,
    props: {
      alt: 'bar',
      embedHtml: props.embedHtml ?? '',
      pending: props.pending ?? false,
      probeSrc: props.probeSrc ?? 'https://cdn.example.com/file',
      rowId: 'row-1',
      showAudio: props.showAudio ?? false,
      showImage: props.showImage ?? false,
      showTypeIcon: props.showTypeIcon ?? false,
      showVideo: props.showVideo ?? false,
      showWarning: props.showWarning ?? false,
      thumbSize: props.thumbSize ?? 'massEdit',
      typeIconName: props.typeIconName ?? '',
      warningTooltip: 'Medium not found / Invalid URL'
    }
  })
}

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Image pending hides the bitmap until load; load and error emit.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb emits image load and error', async () => {
  const w = mountThumb({
    pending: true,
    probeSrc: 'https://cdn.example.com/a.png',
    showImage: true
  })

  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').classes()
  ).toContain('dialogProjectMediaMassEditPreviewThumb__image--pending')
  await w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').trigger('load')
  await w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').trigger('error')
  expect(w.emitted('load')).toHaveLength(1)
  expect(w.emitted('error')).toHaveLength(1)
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * A new preview URL replaces the media element so a late load or error from the previous URL cannot apply.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb replaces the image when the probe URL changes', async () => {
  const w = mountThumb({
    probeSrc: 'https://cdn.example.com/a.png',
    showImage: true
  })
  const firstImage = w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').element
  await w.setProps({ probeSrc: 'https://cdn.example.com/b.png' })
  const secondImage = w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').element
  expect(secondImage).not.toBe(firstImage)
  expect((secondImage as HTMLImageElement).getAttribute('src')).toBe('https://cdn.example.com/b.png')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Warning state shows the tooltip hook and error frame.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb shows the warning glyph', () => {
  const w = mountThumb({ showWarning: true })

  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-preview-row-1"]').classes()
  ).toContain('dialogProjectMediaMassEditPreviewThumb--previewError')
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').attributes(
      'data-test-tooltip-text'
    )
  ).toBe('Medium not found / Invalid URL')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Type icon plus hidden video probe emit load from loadedmetadata.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb emits video metadata load', async () => {
  const w = mountThumb({
    showTypeIcon: true,
    showVideo: true,
    typeIconName: 'video_file'
  })

  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').attributes('name')
  ).toBe('video_file')
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').attributes('color')
  ).toBe('accent')
  await w.get('[data-test-locator="dialogProjectMedia-massEdit-previewVideo-row-1"]').trigger(
    'loadedmetadata'
  )
  await w.get('[data-test-locator="dialogProjectMedia-massEdit-previewVideo-row-1"]').trigger('error')
  expect(w.emitted('load')).toHaveLength(1)
  expect(w.emitted('error')).toHaveLength(1)
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Hidden audio probe emits load and error.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb emits audio metadata load', async () => {
  const w = mountThumb({
    showAudio: true,
    showTypeIcon: true,
    typeIconName: 'audio_file'
  })

  const audio = w.get('[data-test-locator="dialogProjectMedia-massEdit-previewAudio-row-1"]')
  expect(audio.attributes('preload')).toBe('metadata')
  await audio.trigger('loadedmetadata')
  await audio.trigger('error')
  expect(w.emitted('load')).toHaveLength(1)
  expect(w.emitted('error')).toHaveLength(1)
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Embed success glyph uses the file-code icon name.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb shows an embed type icon', () => {
  const w = mountThumb({
    showTypeIcon: true,
    typeIconName: 'fa-solid fa-file-code'
  })

  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').attributes('name')
  ).toBe('fa-solid fa-file-code')
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').attributes('color')
  ).toBe('accent')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Caption overlay is omitted until a caption string is passed.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb hides an empty caption overlay', () => {
  const w = mountThumb({ showImage: true })

  expect(
    w.find('[data-test-locator="dialogProjectMedia-massEdit-previewCaption-row-1"]').exists()
  ).toBe(false)
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Nonempty caption renders the overlay text and follows later caption props.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb shows a caption overlay', async () => {
  const w = mount(DialogProjectMediaMassEditPreviewThumb, {
    global: thumbGlobal,
    props: {
      alt: 'bar',
      caption: 'drive-download.zip',
      pending: false,
      probeSrc: 'https://cdn.example.com/a.png',
      rowId: 'row-1',
      showAudio: false,
      showImage: true,
      showTypeIcon: false,
      showVideo: false,
      showWarning: false,
      thumbSize: 'list',
      typeIconName: '',
      warningTooltip: 'Medium not found / Invalid URL'
    }
  })

  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewCaption-row-1"]').text()
  ).toBe('drive-download.zip')
  await w.setProps({ caption: 'renamed.png' })
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewCaption-row-1"]').text()
  ).toBe('renamed.png')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * List size uses the list BEM modifier.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb can render at list size', () => {
  const w = mount(DialogProjectMediaMassEditPreviewThumb, {
    global: thumbGlobal,
    props: {
      alt: 'bar',
      pending: false,
      probeSrc: '',
      rowId: 'row-1',
      showAudio: false,
      showImage: false,
      showTypeIcon: false,
      showVideo: false,
      showWarning: true,
      thumbSize: 'list',
      typeIconName: '',
      warningTooltip: 'Medium not found / Invalid URL'
    }
  })

  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-preview-row-1"]').classes()
  ).toContain('dialogProjectMediaMassEditPreviewThumb--list')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Single-edit video is a visible player with controls, not a glyph.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb single-edit video is a player', () => {
  const w = mountThumb({
    probeSrc: 'https://cdn.example.com/clip.mp4',
    showTypeIcon: true,
    showVideo: true,
    thumbSize: 'singleEdit',
    typeIconName: 'video_file'
  })

  const video = w.get('[data-test-locator="dialogProjectMedia-massEdit-previewVideo-row-1"]')
  expect(video.classes()).toContain('dialogProjectMediaMassEditPreviewThumb__videoPlayer')
  expect(video.attributes('controls')).toBeDefined()
  expect(
    w.find('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').exists()
  ).toBe(false)
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-preview-row-1"]').classes()
  ).toContain('dialogProjectMediaMassEditPreviewThumb--singleEdit')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * A failed single-edit video stays mounted so the next URL can still load.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb keeps a failed single-edit video mounted', async () => {
  const w = mountThumb({
    probeSrc: 'https://cdn.example.com/broken.mp4',
    showVideo: true,
    showWarning: true,
    thumbSize: 'singleEdit',
    typeIconName: 'video_file'
  })

  const video = w.get('[data-test-locator="dialogProjectMedia-massEdit-previewVideo-row-1"]')
  expect(video.classes()).toContain('dialogProjectMediaMassEditPreviewThumb__mediaProbe')
  expect(video.attributes('controls')).toBeUndefined()
  await video.trigger('loadedmetadata')
  expect(w.emitted('load')).toHaveLength(1)
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Single-edit audio relayouts native controls after metadata and the slide delay.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb single-edit audio is a player', async () => {
  vi.useFakeTimers()
  const w = mountThumb({
    probeSrc: 'https://cdn.example.com/track.mp3',
    showAudio: true,
    showTypeIcon: true,
    thumbSize: 'singleEdit',
    typeIconName: 'audio_file'
  })

  const run = (async () => {
    const audio = w.get('[data-test-locator="dialogProjectMedia-massEdit-previewAudio-row-1"]')
    expect(audio.classes()).toContain('dialogProjectMediaMassEditPreviewThumb__audioPlayer')
    expect(audio.attributes('controls')).toBeDefined()
    expect(audio.attributes('preload')).toBe('auto')
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-preview-row-1"]').classes()
    ).toContain('dialogProjectMediaMassEditPreviewThumb--singleEditAudio')
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-preview-row-1"]').classes()
    ).not.toContain('dialogProjectMediaMassEditPreviewThumb--previewGlyph')
    await audio.trigger('loadedmetadata')
    expect(w.emitted('load')).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(FA_PROJECT_MEDIA_AUDIO_CONTROLS_RELAYOUT_MS)
    expect(audio.attributes('controls')).toBeDefined()
  })()
  await run.finally(() => {
    w.unmount()
    vi.useRealTimers()
  })
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Single-edit embed injects the raw HTML and drops the type icon.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb single-edit embed renders raw HTML', () => {
  const w = mountThumb({
    embedHtml: '<iframe title="clip"></iframe>',
    showTypeIcon: true,
    thumbSize: 'singleEdit',
    typeIconName: 'fa-solid fa-file-code'
  })

  expect(w.get('[data-test-locator="dialogProjectMedia-massEdit-previewEmbed-row-1"]').html())
    .toContain('<iframe title="clip"></iframe>')
  expect(
    w.find('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').exists()
  ).toBe(false)
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-preview-row-1"]').classes()
  ).toContain('dialogProjectMediaMassEditPreviewThumb--singleEditEmbed')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditPreviewThumb
 * Mass-edit video stays a hidden probe plus type icon.
 */
test('Test that DialogProjectMediaMassEditPreviewThumb mass-edit video stays a hidden probe', () => {
  const w = mountThumb({
    showTypeIcon: true,
    showVideo: true,
    typeIconName: 'video_file'
  })

  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewVideo-row-1"]').classes()
  ).toContain('dialogProjectMediaMassEditPreviewThumb__mediaProbe')
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewVideo-row-1"]').attributes(
      'controls'
    )
  ).toBeUndefined()
  w.unmount()
})
