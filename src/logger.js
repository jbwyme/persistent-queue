export default class Logger {
  constructor(options) {
    this._options = Object.assign({debug: false}, options || {});
  }

  log() {
    if (this._options.debug) {
      console.log(arguments);
    }
  }
}

