var babelHelpers = {};
babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers;

/* no-console: false */

var Logger = function () {
  function Logger(options) {
    babelHelpers.classCallCheck(this, Logger);

    this._options = Object.assign({ debug: false }, options || {});
  }

  babelHelpers.createClass(Logger, [{
    key: "log",
    value: function log() {
      if (this._options.debug) {
        /* eslint-disable no-console */
        console.log(arguments);
        /* eslint-enable no-console */
      }
    }
  }]);
  return Logger;
}();

var existingNamespaces = {};
var STORAGE_TYPE_LOCAL_STORAGE = 'localstorage';
var STORAGE_TYPE_COOKIE = 'cookie';
var STORAGE_TYPE_MEMORY = 'memory';

var PersistentStore = function () {
  function PersistentStore(namespace) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    babelHelpers.classCallCheck(this, PersistentStore);

    if (existingNamespaces[namespace]) {
      throw new Error('Namespace \'' + namespace + '\' already exists');
    } else {
      existingNamespaces[namespace] = true;
    }
    this._namespace = namespace;
    this._options = Object.assign({ debug: false }, options || {});
    this.logger = new Logger({ debug: this._options.debug });

    if (this._localStorageAvailable()) {
      this._storageType = STORAGE_TYPE_LOCAL_STORAGE;
    } else if (this._cookiesAvailable()) {
      this._storageType = STORAGE_TYPE_COOKIE;
    } else {
      this._storageType = STORAGE_TYPE_MEMORY;
      this._store = {};
    }
    this.logger.log('Using storage type: ' + this._storageType);
  }

  babelHelpers.createClass(PersistentStore, [{
    key: '_cookiesAvailable',
    value: function _cookiesAvailable() {
      try {
        this._createCookie('test', 'val', 1);
        return true;
      } catch (e) {
        return false;
      }
    }

    /**
    * Creates new cookie or removes cookie with negative expiration
    * @param  key       The key or identifier for the store
    * @param  value     Contents of the store
    * @param  exp       Expiration - creation defaults to 30 days
    */

  }, {
    key: '_createCookie',
    value: function _createCookie(key, value, exp) {
      var date = new Date();
      date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
      var expires = '; expires=' + date.toGMTString();
      document.cookie = key + '=' + value + expires + '; path=/';
    }
  }, {
    key: '_localStorageAvailable',
    value: function _localStorageAvailable() {
      try {
        var storage = window['localStorage'],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
      } catch (e) {
        return false;
      }
    }

    /**
     * Returns contents of cookie
     * @param  key       The key or identifier for the store
     */

  }, {
    key: '_readCookie',
    value: function _readCookie(key) {
      var nameEQ = key + '=';
      var ca = document.cookie.split(';');
      for (var i = 0, max = ca.length; i < max; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
  }, {
    key: 'get',
    value: function get(key) {
      key = this._namespace + '_' + key;
      var data;
      switch (this._storageType) {
        case STORAGE_TYPE_LOCAL_STORAGE:
          data = localStorage.getItem(key);
          break;
        case STORAGE_TYPE_COOKIE:
          data = this._readCookie(key);
          break;
        case STORAGE_TYPE_MEMORY:
          data = this._store[key];
          break;
        default:
          throw new Error('UnsupportedStorageType', this._storageType);
      }

      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      key = this._namespace + '_' + key;
      this.logger.log('set', key, value);
      if (value === null) {
        switch (this._storageType) {
          case STORAGE_TYPE_LOCAL_STORAGE:
            localStorage.removeItem(key);
            break;
          case STORAGE_TYPE_COOKIE:
            this._createCookie(key, '', -1);
            break;
          case STORAGE_TYPE_MEMORY:
            delete this._store[key];
            break;
          default:
            throw new Error('UnsupportedStorageType', this._storageType);
        }
      } else {
        if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object') {
          value = JSON.stringify(value);
        }

        switch (this._storageType) {
          case STORAGE_TYPE_LOCAL_STORAGE:
            localStorage.setItem(key, value);
            break;
          case STORAGE_TYPE_COOKIE:
            this._createCookie(key, value, 30);
            break;
          case STORAGE_TYPE_MEMORY:
            this._store[key] = value;
            break;
          default:
            throw new Error('UnsupportedStorageType', this._storageType);
        }
      }
    }
  }]);
  return PersistentStore;
}();

var existingQueues = {};

var Queue = function () {
  function Queue(key, options) {
    babelHelpers.classCallCheck(this, Queue);

    if (existingQueues[key]) {
      throw new Error('QueueAlreadyExists');
    } else {
      existingQueues[key] = true;
    }
    this._key = key;
    this._options = Object.assign({ debug: false }, options || {});
    this.logger = new Logger({ debug: this._options.debug });
    this._store = new PersistentStore(this._key, this._options);
    this._queue = this._store.get('queue') || [];
    this._locks = {};
  }

  babelHelpers.createClass(Queue, [{
    key: '_lock',
    value: function _lock(item) {
      if (this._locked(item)) {
        throw new Error('ItemAlreadyLocked');
      } else {
        this._locks[item.id] = true;
        this.logger.log('Acquired lock for item ', item.id);
      }
    }
  }, {
    key: '_locked',
    value: function _locked(item) {
      return !!this._locks[item.id];
    }
  }, {
    key: '_persist',
    value: function _persist() {
      this._store.set('queue', this._queue);
    }
  }, {
    key: 'add',
    value: function add(payload) {
      var item = {
        id: (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase(),
        payload: payload
      };
      this._queue.push(item);
      this._persist();
      this.logger.log('added ' + item.id + ' to queue');
      return item;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this._locks = [];
      this._queue = [];
      this._persist();
    }
  }, {
    key: 'next',
    value: function next() {
      for (var i = 0; i < this._queue.length; i++) {
        var item = this._queue[i];
        if (!this._locked(item)) {
          this._lock(item);
          this.logger.log('Returning item ' + item.id + ' from queue');
          return item;
        }
      }
      return null;
    }
  }, {
    key: 'remove',
    value: function remove(item) {
      if (!this._locked(item)) {
        throw new Error('ItemNotLocked');
      } else {
        for (var i = 0; i < this._queue.length; i++) {
          if (item.id === this._queue[i].id) {
            this._queue.splice(i, 1);
            this._persist();
            this.logger.log('Removed item ' + item.id + 'from queue');
            return true;
          }
        }
        return false;
      }
    }
  }, {
    key: 'size',
    value: function size() {
      return this._queue.length;
    }
  }]);
  return Queue;
}();

export default Queue;