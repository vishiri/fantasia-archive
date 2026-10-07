import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import type { I_faProjectMediaMassEditRow } from 'app/types/I_faProjectMediaDomain'
import type { I_faSelectInputObjectItem } from 'app/types/I_faSelectInput'

import { FA_PROJECT_MEDIA_MASS_EDIT_PREVIEW_DEBOUNCE_MS } from 'app/src/scripts/faProjectMedia/faProjectMedia_manager'

import DialogProjectMediaMassEditBlock from '../DialogProjectMediaMassEditBlock.vue'

const sampleRow: I_faProjectMediaMassEditRow = {
  id: 'row-1',
  displayName: 'bar',
  type: 'external',
  internalType: 'linked_outside',
  externalType: 'linked',
  externalLink: 'https://cdn.example.com/foo/bar.png',
  externalEmbed: '',
  internalLink: '',
  internalEmbed: null,
  createdAtMs: 0,
  updatedAtMs: 0,
  isNew: true
}

const typeOptions: I_faSelectInputObjectItem[] = [
  {
    id: 'internal',
    name: 'Internal'
  },
  {
    id: 'external',
    name: 'External'
  }
]

const internalTypeOptions: I_faSelectInputObjectItem[] = [
  {
    id: 'embedded',
    name: 'Embedded'
  },
  {
    id: 'linked_outside',
    name: 'Linked outside project'
  },
  {
    id: 'linked_in_project',
    name: 'Linked in project'
  }
]

const externalTypeOptions: I_faSelectInputObjectItem[] = [
  {
    id: 'linked',
    name: 'Linked'
  },
  {
    id: 'embed',
    icon: 'fa-solid fa-file-code',
    name: 'Embed'
  }
]

const blockGlobal = {
  mocks: { $t: (k: string) => k },
  stubs: {
    FaSelectInput: {
      name: 'FaSelectInput',
      props: ['modelValue', 'disable', 'testLocator', 'options', 'label'],
      emits: ['update:modelValue'],
      template: `
        <button
          type="button"
          v-bind="$attrs"
          :data-test-locator="testLocator"
          :data-disabled="String(disable)"
          @click="$emit('update:modelValue', options[0])"
        >{{ label }}</button>
      `
    },
    QIcon: {
      inheritAttrs: true,
      template: '<i v-bind="$attrs" />'
    },
    QInput: {
      props: {
        modelValue: {
          default: '',
          type: String
        },
        disable: {
          default: false,
          type: Boolean
        },
        label: {
          default: '',
          type: String
        }
      },
      emits: ['update:modelValue'],
      template: `
        <input
          v-bind="$attrs"
          :disabled="disable"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target).value)"
        />
      `
    },
    QTooltip: {
      template: '<span><slot /></span>'
    }
  }
} as const

function mountBlock (row: I_faProjectMediaMassEditRow) {
  return mount(DialogProjectMediaMassEditBlock, {
    global: blockGlobal,
    props: {
      externalTypeOptions,
      internalTypeOptions,
      row,
      typeOptions
    }
  })
}

function lastEmittedRow (wrapper: VueWrapper): I_faProjectMediaMassEditRow {
  const emitted = wrapper.emitted('update:row')
  const last = emitted?.[emitted.length - 1]?.[0] as I_faProjectMediaMassEditRow | undefined
  if (last === undefined) {
    throw new Error('expected update:row')
  }
  return last
}

/**
 * DialogProjectMediaMassEditBlock
 * External row shows title, type, external subtype, external URL, and preview img.
 */
test('Test that DialogProjectMediaMassEditBlock renders external fields and preview', () => {
  const w = mountBlock({ ...sampleRow })

  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-block-row-1"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-title-row-1"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-type-row-1"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-externalType-row-1"]').exists()).toBe(
    true
  )
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-externalLink-row-1"]').exists()).toBe(
    true
  )
  expect(
    w.find('[data-test-locator="dialogProjectMedia-massEdit-externalEmbed-row-1"]').exists()
  ).toBe(false)
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-internalType-row-1"]').exists()).toBe(
    false
  )
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-internalLink-row-1"]').exists()).toBe(
    false
  )
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').attributes('src')
  ).toBe('https://cdn.example.com/foo/bar.png')
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').classes()
  ).toContain('dialogProjectMediaMassEditPreviewThumb__image--pending')
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').exists()).toBe(
    false
  )
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-preview-row-1"]').classes()
  ).not.toContain('dialogProjectMediaMassEditPreviewThumb--previewError')
  expect(
    w.find('[data-test-locator="dialogProjectMedia-massEdit-previewCaption-row-1"]').exists()
  ).toBe(false)
  w.unmount()
})

/**
 * DialogProjectMediaMassEditBlock
 * Internal embedded hides external pair and disables internal URL.
 */
test('Test that DialogProjectMediaMassEditBlock shows internal pair and disables embedded URL', () => {
  const row: I_faProjectMediaMassEditRow = {
    ...sampleRow,
    type: 'internal',
    internalType: 'embedded',
    externalType: '',
    externalLink: '',
    internalLink: ''
  }
  const w = mountBlock(row)

  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-internalType-row-1"]').exists()).toBe(
    true
  )
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-internalLink-row-1"]').exists()).toBe(
    true
  )
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-externalType-row-1"]').exists()).toBe(
    false
  )
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-externalLink-row-1"]').exists()).toBe(
    false
  )
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-internalLink-row-1"]').attributes('disabled')
  ).toBeDefined()
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').exists()).toBe(
    false
  )
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').exists()).toBe(
    true
  )
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').attributes(
      'data-test-tooltip-text'
    )
  ).toBe('dialogs.projectMedia.massEditPreviewInvalidTooltip')
  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-preview-row-1"]').classes()
  ).toContain('dialogProjectMediaMassEditPreviewThumb--previewError')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditBlock
 * Empty visible URL shows the invalid-preview warning instead of an image.
 */
test('Test that DialogProjectMediaMassEditBlock warns when the preview URL is empty', () => {
  const w = mountBlock({
    ...sampleRow,
    externalLink: ''
  })

  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').exists()).toBe(
    false
  )
  expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').exists()).toBe(
    true
  )
  w.unmount()
})

/**
 * DialogProjectMediaMassEditBlock
 * Broken preview stays hidden; a new URL keeps the warning until load.
 */
test('Test that DialogProjectMediaMassEditBlock hides a failed preview until URL changes', async () => {
  vi.useFakeTimers()
  const w = mountBlock({ ...sampleRow })
  const run = (async () => {
    await w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').trigger('error')
    await flushPromises()
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').classes()
    ).toContain('dialogProjectMediaMassEditPreviewThumb__image--pending')
    expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').exists()).toBe(
      true
    )

    await w.get('[data-test-locator="dialogProjectMedia-massEdit-externalLink-row-1"]').setValue(
      'https://cdn.example.com/foo/other.png'
    )
    await flushPromises()
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').attributes('src')
    ).toBe('https://cdn.example.com/foo/bar.png')
    expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').exists()).toBe(
      true
    )

    await vi.advanceTimersByTimeAsync(FA_PROJECT_MEDIA_MASS_EDIT_PREVIEW_DEBOUNCE_MS)
    await flushPromises()
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').attributes('src')
    ).toBe('https://cdn.example.com/foo/other.png')
    expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').exists()).toBe(
      true
    )

    await w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').trigger('load')
    await flushPromises()
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').classes()
    ).not.toContain('dialogProjectMediaMassEditPreviewThumb__image--pending')
    expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').exists()).toBe(
      false
    )
  })()
  await run.finally(() => {
    w.unmount()
    vi.useRealTimers()
  })
})

/**
 * DialogProjectMediaMassEditBlock
 * Type select still patches the row.
 */
test('Test that DialogProjectMediaMassEditBlock type select patches the row', async () => {
  const w = mountBlock({ ...sampleRow })

  await w.get('[data-test-locator="dialogProjectMedia-massEdit-type-row-1"]').trigger('click')
  expect(lastEmittedRow(w).type).toBe('internal')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditBlock
 * Title and URL fields emit replaced row objects.
 */
test('Test that DialogProjectMediaMassEditBlock title and link fields emit row updates', async () => {
  const w = mountBlock({ ...sampleRow })

  await w.get('[data-test-locator="dialogProjectMedia-massEdit-title-row-1"]').setValue('renamed')
  expect(lastEmittedRow(w).displayName).toBe('renamed')

  await w.get('[data-test-locator="dialogProjectMedia-massEdit-externalType-row-1"]').trigger('click')
  expect(lastEmittedRow(w).externalType).toBe('linked')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditBlock
 * Internal Type select and Internal link emit replaced row objects.
 */
test('Test that DialogProjectMediaMassEditBlock internal type and link emit row updates', async () => {
  const row: I_faProjectMediaMassEditRow = {
    ...sampleRow,
    type: 'internal',
    internalType: 'linked_outside',
    externalType: '',
    externalLink: '',
    internalLink: 'https://inside.test/a.png'
  }
  const w = mountBlock(row)

  expect(
    w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').attributes('src')
  ).toBe('https://inside.test/a.png')

  await w.get('[data-test-locator="dialogProjectMedia-massEdit-internalLink-row-1"]').setValue(
    'https://inside.test/b.png'
  )
  expect(lastEmittedRow(w).internalLink).toBe('https://inside.test/b.png')

  await w.get('[data-test-locator="dialogProjectMedia-massEdit-internalType-row-1"]').trigger('click')
  expect(lastEmittedRow(w).internalType).toBe('embedded')
  w.unmount()
})

/**
 * DialogProjectMediaMassEditBlock
 * A video URL probes with a hidden video and shows video_file after metadata.
 */
test('Test that DialogProjectMediaMassEditBlock shows a video type icon after metadata', async () => {
  const w = mountBlock({
    ...sampleRow,
    externalLink: 'https://cdn.example.com/clip.mp4'
  })
  const run = (async () => {
    expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').exists()).toBe(
      false
    )
    expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewVideo-row-1"]').exists()).toBe(
      true
    )
    expect(
      w.find('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').exists()
    ).toBe(false)

    await w.get('[data-test-locator="dialogProjectMedia-massEdit-previewVideo-row-1"]').trigger(
      'loadedmetadata'
    )
    await flushPromises()
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').attributes('name')
    ).toBe('video_file')
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').attributes('color')
    ).toBe('accent')
    expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').exists()).toBe(
      false
    )
  })()
  await run.finally(() => {
    w.unmount()
  })
})

/**
 * DialogProjectMediaMassEditBlock
 * An audio URL probes with a hidden audio element.
 */
test('Test that DialogProjectMediaMassEditBlock shows an audio type icon after metadata', async () => {
  const w = mountBlock({
    ...sampleRow,
    externalLink: 'https://cdn.example.com/track.mp3'
  })
  const run = (async () => {
    await w.get('[data-test-locator="dialogProjectMedia-massEdit-previewAudio-row-1"]').trigger(
      'loadedmetadata'
    )
    await flushPromises()
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').attributes('name')
    ).toBe('audio_file')
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').attributes('color')
    ).toBe('accent')
  })()
  await run.finally(() => {
    w.unmount()
  })
})

/**
 * DialogProjectMediaMassEditBlock
 * Text-like extensions try as an image, not a type icon.
 */
test('Test that DialogProjectMediaMassEditBlock treats text URLs as images', async () => {
  const w = mountBlock({
    ...sampleRow,
    externalLink: 'https://cdn.example.com/note.md'
  })
  const run = (async () => {
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').attributes('src')
    ).toBe('https://cdn.example.com/note.md')
    expect(
      w.find('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').exists()
    ).toBe(false)
  })()
  await run.finally(() => {
    w.unmount()
  })
})

/**
 * DialogProjectMediaMassEditBlock
 * Embed type shows the embed body instead of External link.
 */
test('Test that DialogProjectMediaMassEditBlock shows embed body instead of external link', async () => {
  const w = mountBlock({
    ...sampleRow,
    externalType: 'embed',
    externalEmbed: '<iframe src="https://www.youtube.com/embed/x"></iframe>'
  })
  const run = (async () => {
    expect(
      w.find('[data-test-locator="dialogProjectMedia-massEdit-externalEmbed-row-1"]').exists()
    ).toBe(true)
    expect(
      w.find('[data-test-locator="dialogProjectMedia-massEdit-externalLink-row-1"]').exists()
    ).toBe(false)
    expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').exists()).toBe(
      false
    )
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').attributes('name')
    ).toBe('fa-solid fa-file-code')
    expect(
      w.get('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').attributes('color')
    ).toBe('accent')
  })()
  await run.finally(() => {
    w.unmount()
  })
})

/**
 * DialogProjectMediaMassEditBlock
 * Empty embed body shows the invalid preview warning.
 */
test('Test that DialogProjectMediaMassEditBlock warns when the embed body is empty', async () => {
  const w = mountBlock({
    ...sampleRow,
    externalType: 'embed',
    externalEmbed: '   ',
    externalLink: 'https://cdn.example.com/foo/bar.png'
  })
  const run = (async () => {
    expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewImage-row-1"]').exists()).toBe(
      false
    )
    expect(w.find('[data-test-locator="dialogProjectMedia-massEdit-previewWarning-row-1"]').exists()).toBe(
      true
    )
    expect(
      w.find('[data-test-locator="dialogProjectMedia-massEdit-previewTypeIcon-row-1"]').exists()
    ).toBe(false)
  })()
  await run.finally(() => {
    w.unmount()
  })
})

/**
 * DialogProjectMediaMassEditBlock
 * Embed body edits emit a replaced row object.
 */
test('Test that DialogProjectMediaMassEditBlock embed body emits row updates', async () => {
  const w = mountBlock({
    ...sampleRow,
    externalType: 'embed'
  })

  await w.get('[data-test-locator="dialogProjectMedia-massEdit-externalEmbed-row-1"]').setValue(
    '<iframe></iframe>'
  )
  expect(lastEmittedRow(w).externalEmbed).toBe('<iframe></iframe>')
  w.unmount()
})
