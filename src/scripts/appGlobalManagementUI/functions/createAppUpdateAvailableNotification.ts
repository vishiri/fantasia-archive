/**
 * Builds the sticky info Notify when a newer app version is available.
 * Download CTA lives in caption HTML (under the copy), not in q-notification__actions.
 */

export const FA_NOTIFY_APP_UPDATE_AVAILABLE_CLASS = 'fa-notifyAppUpdateAvailable'
export const FA_NOTIFY_APP_UPDATE_DOWNLOAD_CLASS = 'fa-notifyAppUpdateAvailable__download'
export const FA_NOTIFY_APP_UPDATE_OPEN_RELEASES_DELAY_MS = 500

function escapeHtmlText (value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function createAppUpdateAvailableNotification (deps: {
  attachDownloadClick: (input: { onDownload: () => void }) => void
  createNotify: (opts: {
    actions: Array<{
      color: string
      icon?: string
    }>
    avatar?: string
    caption: string
    classes: string
    color: string
    html: boolean
    message: string
    position: 'bottom-right'
    timeout: number
  }) => (() => void) | void
  delay: (ms: number, callback: () => void) => void
  openReleasesPage: () => void
  resolveMascotAvatar: (hideMascot: boolean) => string | undefined
  t: (key: string, params?: { version: string }) => string
}): {
    showAppUpdateAvailableNotification: (input: {
      hideMascot: boolean
      onShown: (dismiss: () => void) => void
      version: string
    }) => void
  } {
  const showAppUpdateAvailableNotification = (input: {
    hideMascot: boolean
    onShown: (dismiss: () => void) => void
    version: string
  }): void => {
    const avatar = deps.resolveMascotAvatar(input.hideMascot)
    let dismissNotify: (() => void) | undefined

    const dismissSelf = (): void => {
      if (dismissNotify !== undefined) {
        dismissNotify()
      }
    }

    const versionHtml = `<span class="fa-notifyAppUpdateAvailable__version">${escapeHtmlText(input.version)}</span>`
    const downloadLabel = escapeHtmlText(
      deps.t('globalFunctionality.appUpdateCheck.download')
    )
    const subtitle = escapeHtmlText(
      deps.t('globalFunctionality.appUpdateCheck.subtitle')
    )
    const captionHtml = `${subtitle}<div class="fa-notifyAppUpdateAvailable__cta"><button class="q-btn q-btn-item non-selectable no-outline q-btn--push q-btn--rectangle bg-positive text-white q-btn--actionable q-focusable q-hoverable ${FA_NOTIFY_APP_UPDATE_DOWNLOAD_CLASS}" tabindex="0" type="button"><span class="q-focus-helper" tabindex="-1"></span><span class="q-btn__content text-center col items-center q-anchor--skip justify-center row"><span class="block">${downloadLabel}</span></span></button></div>`

    const closeAction = {
      color: 'dark',
      icon: 'mdi-close'
    }

    const dismissOrVoid = deps.createNotify({
      actions: [closeAction],
      ...(avatar !== undefined ? { avatar } : {}),
      caption: captionHtml,
      classes: FA_NOTIFY_APP_UPDATE_AVAILABLE_CLASS,
      color: 'info',
      html: true,
      message: deps.t('globalFunctionality.appUpdateCheck.title', {
        version: versionHtml
      }),
      position: 'bottom-right',
      timeout: 0
    })

    if (typeof dismissOrVoid === 'function') {
      dismissNotify = dismissOrVoid
      input.onShown(dismissOrVoid)
    }

    deps.attachDownloadClick({
      onDownload: () => {
        dismissSelf()
        deps.delay(FA_NOTIFY_APP_UPDATE_OPEN_RELEASES_DELAY_MS, () => {
          deps.openReleasesPage()
        })
      }
    })
  }

  return {
    showAppUpdateAvailableNotification
  }
}
