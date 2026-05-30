export function createUseSplashControls (deps: {
  resolveVitePublicAssetPath: (pathFromPublicRoot: string) => string
}): () => {
    splashTitleWingSrc: string
  } {
  return function useSplashControls () {
    const splashTitleWingSrc = deps.resolveVitePublicAssetPath('images/splash/splash_logo.png')

    return {
      splashTitleWingSrc
    }
  }
}
