let dialogProjectMediaSaveTail: Promise<void> | undefined

function clearDialogProjectMediaSaveTail (settled: Promise<void>): void {
  if (dialogProjectMediaSaveTail === settled) {
    dialogProjectMediaSaveTail = undefined
  }
}

export function enqueueDialogProjectMediaSave<T> (run: () => Promise<T>): Promise<T> {
  const previous = dialogProjectMediaSaveTail
  const result = previous === undefined
    ? run()
    : previous.then(run, run)
  const settled = result.then(() => {
    clearDialogProjectMediaSaveTail(settled)
  }, () => {
    clearDialogProjectMediaSaveTail(settled)
  })
  dialogProjectMediaSaveTail = settled
  return result
}
