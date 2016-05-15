/* globals afterEach, describe, it */
import { expect } from 'chai';
import sinon from 'sinon';

import Queue from '../src/queue';

describe('Queue', () => {
  const queue = new Queue('test_key', {debug: true});
  sinon.stub(queue, '_persist');

  afterEach(() => {
    queue.clear();
    queue._persist.reset();
  });

  describe('#add', () => {
    it('Should add the item to the queue and return the added item', () => {
      expect(queue.size()).to.equal(0);
      const added = queue.add('test item');
      expect(queue.size()).to.equal(1);
      const item = queue.next();
      expect(item).to.equal(added);
    });

    it('Should not lock the item', () => {
      const item = queue.add('test item');
      expect(queue._locked(item)).to.equal(false);
    });

    it('Should persist the new queue state', () => {
      queue.add('test item');
      expect(queue._persist.calledOnce).to.equal(true);
    });

  });

  describe('#clear', () => {
    it('Should clear the queue', () => {
      queue.add('test item');
      expect(queue.size()).to.equal(1);
      queue.clear();
      expect(queue.size()).to.equal(0);
    });

    it('Should persist the new queue state', () => {
      queue.add('test item');
      expect(queue._persist.calledOnce).to.equal(true);
    });
  });

  /*
  describe('#get', () => {
    it('Should return the item requested', () => {
      const added = queue.add('test item');
      const item = queue.get(added.id);
      expect(item).to.equal(added);
    });

    it('Should lock the item from further reading', () => {
      const added = queue.add('test item');
      queue.get(added.id);
      sinon.spy(queue, 'get');
      queue.get(added.id);
      expect(queue.get.threw('LockError')).to.equal(true);
      queue.get.restore();
    });

    it('Should return null if the item doesn\'t exist in the queue', () => {
      const item = queue.get(12345);
      expect(item).to.equal(null);
    });
  });
  */

  describe('#next', () => {
    it('Should return the next item in the queue', () => {
      const added = queue.add('test item');
      const item = queue.next();
      expect(item).to.equal(added);
    });

    it('Should lock the item', () => {
      const added = queue.add('test item');
      const item = queue.next();
      expect(item).to.equal(added);
      expect(queue._locked(item)).to.equal(true);
    });

    it('Should return null if queue is empty', () => {
      expect(queue.size()).to.equal(0);
      const item = queue.next();
      expect(item).to.equal(null);
    });
  });

  describe('#remove', () => {
    it('Should remove the item from the queue', () => {
      queue.add('test item');
      expect(queue.size()).to.equal(1);
      const removed = queue.remove(queue.next());
      expect(queue.size()).to.equal(0);
      expect(removed).to.equal(true);
    });

    it('Should persist the new queue state', () => {
      queue.add('test item');
      queue._persist.reset();
      queue.remove(queue.next());
      expect(queue._persist.calledOnce).to.equal(true);
    });

    it('Should throw an exception if there is no lock acquired', () => {
      const added = queue.add('test item');
      sinon.spy(queue, 'remove');
      try {
        queue.remove(added);
      } catch (e) {
        // noop
      }
      expect(queue.remove.threw('ItemNotLocked'));
    });
  });

  describe('#size', () => {
    it('Should return the current queue size', () => {
      expect(queue.size()).to.equal(0);
      queue._queue = [{id: 1, payload: 'test item'}];
      expect(queue.size()).to.equal(1);
    });
  });
});
