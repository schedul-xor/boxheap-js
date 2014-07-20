goog.provide('schedul.bh.Coordinate3HeapEvent');

goog.require('goog.events.Event');
goog.require('goog.math.Coordinate3');



/**
 * @constructor
 * @extends {goog.events.Event}
 * @param {!string} type
 * @param {?goog.math.Coordinate3} point
 */
schedul.bh.Coordinate3HeapEvent = function(type, point) {
  goog.base(this, type);
  this.point_ = point;
};
goog.inherits(schedul.bh.Coordinate3HeapEvent, goog.events.Event);


/**
 * @return {?goog.math.Coordinate3}
 */
schedul.bh.Coordinate3HeapEvent.prototype.getPoint = function() {
  return this.point_;
};


/**
 * @param {?goog.math.Coordinate3} point
 */
schedul.bh.Coordinate3HeapEvent.prototype.setPoint = function(point) {
  this.point_ = point;
};
