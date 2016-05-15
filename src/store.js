import Logger from './logger';
import JSON from './json2';

const existingNamespaces = {};
const STORAGE_TYPE_LOCAL_STORAGE = 'localstorage';
const STORAGE_TYPE_COOKIE = 'cookie';
const STORAGE_TYPE_MEMORY = 'memory';

var PersistentStore = function(namespace, options = {}) {
  if (existingNamespaces[namespace]) {
    throw new Error(`Namespace '${namespace}' already exists`);
  } else {
    existingNamespaces[namespace] = true;
  }
  this._namespace = namespace;
  this._options = Object.assign({debug: false}, options || {});
  this.logger = new Logger({debug: this._options.debug});

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

PersistentStore.prototype._cookiesAvailable = function() {
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
PersistentStore.prototype._createCookie = function(key, value, exp) {
  var date = new Date();
  date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
  var expires = '; expires=' + date.toGMTString();
  document.cookie = key + '=' + value + expires + '; path=/';
}

PersistentStore.prototype._localStorageAvailable = function() {
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
PersistentStore.prototype._readCookie = function(key) {
  var nameEQ = key + '=';
  var ca = document.cookie.split(';');
  for (var i = 0, max = ca.length; i < max; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

PersistentStore.prototype.get = function(key) {
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

PersistentStore.prototype.set = function(key, value) {
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
    if ( value instanceof Object ) {
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

export default PersistentStore;
