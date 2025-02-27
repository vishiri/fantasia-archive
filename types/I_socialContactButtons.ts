export interface I_socialContactButton {

  /**
   * Label of the button (actual text seen)
   */
  label: string

  /**
   * Title of the button (hover, tooltip)
   */
  title: string

  /**
   * URL to be opened when the button is clicked
   */
  url: string

  /**
   * Image icon to be displayed on the button
   */
  icon: string

  /**
   * Width of the icon in pixels
   */
  width: number

  /**
   * Height of the icon in pixels
   */
  height: number

  /**
   * CSS class to be applied to the button
   */
  cssClass: string

}

export interface I_socialContactButtons {
  buttonPatreon: I_socialContactButton
  buttonKofi: I_socialContactButton

  buttonWebsite: I_socialContactButton
  buttonGitHub: I_socialContactButton

  buttonDiscord: I_socialContactButton
  buttonReddit: I_socialContactButton
  buttonTwitter: I_socialContactButton
}
