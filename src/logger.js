/* no-console: false */
export default class Logger {
  constructor(options) {
    this._options = Object.assign({debug: false}, options || {});
  }

  log() {
    if (this._options.debug) {
      /* eslint-disable no-console */
      console.log(arguments);
      /* eslint-enable no-console */
    }
  }
}

