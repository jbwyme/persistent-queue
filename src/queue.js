import Logger from './logger';
import PersistentStore from './store';

const existingQueues = {};

export default class Queue {
  constructor(key, options) {
    if (existingQueues[key]) {
      throw new Error('QueueAlreadyExists');
    } else {
      existingQueues[key] = true;
    }
    this._key = key;
    this._options = Object.assign({debug: false}, options || {});
    this.logger = new Logger({debug: this._options.debug});
    this._store = new PersistentStore(this._key, this._options);
    this._queue = this._store.get('queue') || [];
    this._locks = {};
  }

  _lock(item) {
    if (this._locked(item)) {
      throw new Error('ItemAlreadyLocked');
    } else {
      this._locks[item.id] = true;
      this.logger.log('Acquired lock for item ', item.id);
    }
  }

  _locked(item) {
    return !!this._locks[item.id]
  }

  _persist() {
    this._store.set('queue', this._queue);
  }

  add(payload) {
    const item = {
      id: (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase(),
      payload,
    };
    this._queue.push(item);
    this._persist();
    this.logger.log('added ' + item.id + ' to queue');
    return item;
  }

  clear() {
    this._locks = [];
    this._queue = [];
    this._persist();
  }

  next() {
    for(var i = 0; i < this._queue.length; i++) {
      const item = this._queue[i];
      if (!this._locked(item)) {
        this._lock(item);
        this.logger.log('Returning item ' + item.id + ' from queue');
        return item;
      }
    };
    return null;
  }

  remove(item) {
    if (!this._locked(item)) {
      throw new Error('ItemNotLocked')
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

  size() {
    return this._queue.length;
  }
}
