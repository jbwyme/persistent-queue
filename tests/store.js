/* globals beforeEach, describe, it */
import { expect } from 'chai';
import jsdom from 'mocha-jsdom';

import PersistentStore from '../src/store';

jsdom();

describe('PersistentStore', () => {
  let store;

  beforeEach(() => {
    store = new PersistentStore((new Date()).getTime(), {debug: true});
  });

  describe('#get', () => {
    it('should return the requested key', () => {
      store.set('key', 'val');
      expect(store.get('key')).to.equal('val');
    });
  });

  describe('#set', () => {
    it('should update the key to the specified value', () => {
      expect(store.get('key')).to.equal(null);
      store.set('key', 'val');
      expect(store.get('key')).to.equal('val');
    });
  });
});
