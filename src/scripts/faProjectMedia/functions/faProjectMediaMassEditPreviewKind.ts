import type { T_faProjectMediaPreviewKind } from 'app/types/I_faProjectMediaDomain'

export const FA_PROJECT_MEDIA_PREVIEW_ICON_AUDIO = 'audio_file'
export const FA_PROJECT_MEDIA_PREVIEW_ICON_EMBED = 'fa-solid fa-file-code'
export const FA_PROJECT_MEDIA_PREVIEW_ICON_VIDEO = 'video_file'

const audioExtensions = new Set([
  'aac',
  'flac',
  'm4a',
  'mp3',
  'oga',
  'ogg',
  'opus',
  'wav',
  'weba'
])

const videoExtensions = new Set([
  'm4v',
  'mov',
  'mp4',
  'mpeg',
  'mpg',
  'ogv',
  'webm'
])

/**
 * Lowercase path extension from a URL, ignoring query and hash.
 */
export function readFaProjectMediaUrlPathExtension (rawUrl: string): string {
  const trimmed = rawUrl.trim()
  if (trimmed.length === 0) {
    return ''
  }
  let path = trimmed
  if (URL.canParse(trimmed)) {
    path = new URL(trimmed).pathname
  } else {
    const cut = trimmed.split(/[?#]/)[0]
    path = cut ?? trimmed
  }
  const lastSlash = path.lastIndexOf('/')
  const fileName = lastSlash >= 0 ? path.slice(lastSlash + 1) : path
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot <= 0 || lastDot === fileName.length - 1) {
    return ''
  }
  return fileName.slice(lastDot + 1).toLowerCase()
}

/**
 * Thumbnail kind from the URL path extension. Unknown / missing → image.
 */
export function resolveFaProjectMediaMassEditPreviewKind (
  rawUrl: string
): T_faProjectMediaPreviewKind {
  const extension = readFaProjectMediaUrlPathExtension(rawUrl)
  if (videoExtensions.has(extension)) {
    return 'video'
  }
  if (audioExtensions.has(extension)) {
    return 'audio'
  }
  return 'image'
}

/**
 * q-icon name for a non-image thumbnail kind. Image uses the bitmap, not an icon.
 */
export function resolveFaProjectMediaMassEditPreviewTypeIconName (
  kind: T_faProjectMediaPreviewKind
): string {
  if (kind === 'video') {
    return FA_PROJECT_MEDIA_PREVIEW_ICON_VIDEO
  }
  if (kind === 'audio') {
    return FA_PROJECT_MEDIA_PREVIEW_ICON_AUDIO
  }
  if (kind === 'embed') {
    return FA_PROJECT_MEDIA_PREVIEW_ICON_EMBED
  }
  return ''
}
