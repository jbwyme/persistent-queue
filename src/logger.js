var Logger = function(options) {
  this._options = Object.assign({debug: false}, options || {});
}

Logger.prototype.log = function() {
  if (this._options.debug) {
    /* eslint-disable no-console */
    console.log(arguments);
    /* eslint-enable no-console */
  }
}

export default Logger;
