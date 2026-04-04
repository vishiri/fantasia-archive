export const specialCharacterFixer = (inputString: string) => {
  const specialCharacterList = [
    '@',
    '|'
  ]

  specialCharacterList.forEach(character => {
    inputString = inputString.replaceAll(character, `{'${character}'}`)
  })

  return inputString
}
