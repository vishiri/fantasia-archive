/**
 * A list of all Fantasia mascot images currently avaiable
 */
export const fantasiaImageList: { [key: string]: string } = {
  didYouKnow: 'images/fantasiaMascot/fantasia_didYouKnow.png',
  flop: 'images/fantasiaMascot/fantasia_flop.png',
  hug: 'images/fantasiaMascot/fantasia_hug.png',
  reading: 'images/fantasiaMascot/fantasia_reading.png',
  cooking: 'images/fantasiaMascot/fantasia_cooking.png',
  error: 'images/fantasiaMascot/fantasia_error.png'
}

/**
 * Get a random image URL from the whole list of all available images
 * @param list - The list of all available Fantasia mascot images
 * @return A random image URL from the list
 */
export const randomMascotImage = (list: { [key: string]: string }) => {
  // Cryptic code from SO: https://stackoverflow.com/a/15106541
  const keys = Object.keys(list)
  return list[keys[keys.length * Math.random() << 0]]
}

/**
 * Determine what current URL link we will be rendering.
 * If a specific image URL if one is chosen, otherwise return a random image URL.
 * @param list - The list of all available Fantasia mascot images
 * @param isRandom - A boolean value indicating whether to return a random image or a specific one
 * @param id - The specific image URL to return if isRandom is false
 * @return A URL string representing the current image to be rendered
 */
export const determineCurrentImage = (list: { [key: string]: string }, isRandom: boolean, id: string) => {
  if (isRandom) {
    return randomMascotImage(list)
  } else {
    return list[id]
  }
}
