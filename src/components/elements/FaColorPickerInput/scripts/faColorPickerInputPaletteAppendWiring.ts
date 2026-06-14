async function persistWorldColorPalette (
  worldId: string,
  colorPallete: string
): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.updateWorld !== 'function') {
    return false
  }
  try {
    await api.updateWorld(worldId, { colorPallete })
    return true
  } catch {
    return false
  }
}

async function noopRefreshProjectColorPalette (): Promise<void> {
  await Promise.resolve()
}

export const faColorPickerInputPaletteAppendWiring = {
  noopRefreshProjectColorPalette,
  persistWorldColorPalette
}
