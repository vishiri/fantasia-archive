/**
 * Thrown from action handlers when the user backs out (dialog cancel) without a product failure.
 * The action manager records completion without a negative toast or console error row.
 */
export class FaActionUserCanceledError extends Error {
  constructor (message = 'User canceled') {
    super(message)
    this.name = 'FaActionUserCanceledError'
  }
}
