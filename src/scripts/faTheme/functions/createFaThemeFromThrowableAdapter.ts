type T_resultLike<T> = {
  isErr: () => boolean
  isOk: () => boolean
  value: T
}

type T_fromThrowableFn = <T, E>(
  fn: () => T,
  errorFn: (error: unknown) => E
) => () => T_resultLike<T>

export function createFaThemeFromThrowableAdapter (deps: {
  fromThrowable: T_fromThrowableFn
}): T_fromThrowableFn {
  return <T, E>(fn: () => T, errorFn: (error: unknown) => E) => {
    const run = deps.fromThrowable(fn, errorFn)

    return () => {
      const result = run()
      const isErr = (): boolean => {
        return result.isErr()
      }
      const isOk = (): boolean => {
        return result.isOk()
      }
      const value = result.isOk() ? result.value : (undefined as T)

      return {
        isErr,
        isOk,
        value
      }
    }
  }
}
