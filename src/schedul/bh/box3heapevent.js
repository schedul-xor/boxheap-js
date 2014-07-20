goog.provide('schedul.bh.Box3HeapEvent');

goog.require('goog.asserts');
goog.require('goog.events.Event');
goog.require('schedul.math.Box3');



/**
 * @constructor
 * @extends {goog.events.Event}
 * @param {!string} type
 * @param {?schedul.math.Box3} block
 */
schedul.bh.Box3HeapEvent = function(type, block) {
  goog.base(this, type);
  goog.asserts.assertString(type);

  this.block_ = block;
};
goog.inherits(schedul.bh.Box3HeapEvent, goog.events.Event);


/**
 * @return {?schedul.math.Box3}
 */
schedul.bh.Box3HeapEvent.prototype.getBlock = function() {
  return this.block_;
};


/**
 * @param {?schedul.math.Box3} block
 */
schedul.bh.Box3HeapEvent.prototype.setBlock = function(block) {
  this.block_ = block;
};
