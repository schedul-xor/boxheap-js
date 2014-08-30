goog.provide('schedul.math.Box3');

goog.require('goog.asserts');
goog.require('ol.TileCoord');



/**
 * @constructor
 * @param {!number} minX
 * @param {!number} maxX
 * @param {!number} minY
 * @param {!number} maxY
 * @param {!number} minTime
 * @param {!number} maxTime
 * @param {!ol.TileCoord} baseTileCoord
 */
schedul.math.Box3 = function(minX, maxX, minY, maxY, minTime, maxTime,
    baseTileCoord) {
  goog.asserts.assertNumber(minX);
  goog.asserts.assertNumber(maxX);
  goog.asserts.assertNumber(minY);
  goog.asserts.assertNumber(maxY);
  goog.asserts.assertNumber(minTime);
  goog.asserts.assertNumber(maxTime);
  goog.asserts.assertInstanceof(baseTileCoord, ol.TileCoord);

  this.minX_ = minX;
  this.maxX_ = maxX;
  this.minY_ = minY;
  this.maxY_ = maxY;
  this.minTime_ = minTime;
  this.maxTime_ = maxTime;
  this.baseTileCoord_ = baseTileCoord;
};


/**
 * @return {!number}
 */
schedul.math.Box3.prototype.getMinX = function() {
  return this.minX_;
};


/**
 * @return {!number}
 */
schedul.math.Box3.prototype.getMaxX = function() {
  return this.maxX_;
};


/**
 * @return {!number}
 */
schedul.math.Box3.prototype.getMinY = function() {
  return this.minY_;
};


/**
 * @return {!number}
 */
schedul.math.Box3.prototype.getMaxY = function() {
  return this.maxY_;
};


/**
 * @return {!number}
 */
schedul.math.Box3.prototype.getMinTime = function() {
  return this.minTime_;
};


/**
 * @return {!number}
 */
schedul.math.Box3.prototype.getMaxTime = function() {
  return this.maxTime_;
};


/**
 * @return {!ol.TileCoord}
 */
schedul.math.Box3.prototype.getBaseTileCoord = function() {
  return this.baseTileCoord_;
};


/**
 * @return {!string}
 */
schedul.math.Box3.prototype.toString = function() {
  return schedul.math.Box3.hash(this);
};


/**
 * @param {!schedul.math.Box3} blockXyt
 * @return {!string}
 */
schedul.math.Box3.hash = function(blockXyt) {
  return blockXyt.getMinX() + '/' + blockXyt.getMaxX() + '/' + blockXyt.getMinY() + '/' + blockXyt.getMaxY() + '/' + blockXyt.getMinTime() + '/' + blockXyt.getMaxTime();
};
