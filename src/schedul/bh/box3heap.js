goog.provide('schedul.bh.Box3Heap');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('schedul.bh.Box3HeapEvent');
goog.require('schedul.bh.Box3HeapEventType');
goog.require('schedul.bh.Coordinate3Heap');
goog.require('schedul.bh.Coordinate3HeapEvent');
goog.require('schedul.bh.Coordinate3HeapEventType');
goog.require('schedul.math.Box3');



/**
 * If capacity is zero or negative, it will never (even try to) wipe out.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {number=} opt_capacity
 */
schedul.bh.Box3Heap = function(opt_capacity) {
  goog.base(this);

  var capacity = goog.isDefAndNotNull(opt_capacity) ? opt_capacity : -1;

  this.pointHeap_ = new schedul.bh.Coordinate3Heap(capacity * 9);
  goog.events.listen(this.pointHeap_,
                     schedul.bh.Coordinate3HeapEventType.POINT_WIPED,
                     function(ev) {
                       var wipedPoint = ev.getPoint();
                       this.removeAllBlocksRelatedToPoint_(wipedPoint);
                     },
                     true, this);

  this.p_ = new Array(9);
  this.point2block_ = {};
  this.block2point_ = {};
  this.blockSize_ = 0;
  this.capacity_ = capacity;
  this.defaultBlockEvent_ = new schedul.bh.Box3HeapEvent(schedul.bh.Box3HeapEventType.BLOCK_WIPED, null);

  this.pointSearchResultVessel_ = [];
  this.blockSearchCacheVessel_ = {};
};
goog.inherits(schedul.bh.Box3Heap, goog.events.EventTarget);


/**
 * @param {!schedul.math.Box3} block
 */
schedul.bh.Box3Heap.prototype.addBlock = function(block) {
  goog.asserts.assertInstanceof(block, schedul.math.Box3);
  var blockHash = block.toString();

  var lnmn = block.getMinX();
  var lnmx = block.getMaxX();
  var lamn = block.getMinY();
  var lamx = block.getMaxY();
  var timn = block.getMinTime();
  var timx = block.getMaxTime();

  this.p_[0] = new goog.math.Coordinate3(lnmn, lamn, timn);
  this.p_[1] = new goog.math.Coordinate3(lnmx, lamn, timn);
  this.p_[2] = new goog.math.Coordinate3(lnmn, lamx, timn);
  this.p_[3] = new goog.math.Coordinate3(lnmx, lamx, timn);
  this.p_[4] = new goog.math.Coordinate3(lnmn, lamn, timx);
  this.p_[5] = new goog.math.Coordinate3(lnmx, lamn, timx);
  this.p_[6] = new goog.math.Coordinate3(lnmn, lamx, timx);
  this.p_[7] = new goog.math.Coordinate3(lnmx, lamx, timx);
  this.p_[8] = new goog.math.Coordinate3(
      (lnmn + lnmx) / 2,
      (lamn + lamx) / 2,
      (timn + timx) / 2);

  goog.array.forEach(this.p_, function(point, index) {
    var pointHash = point.toString();
    this.addBlockPointRelation_(block, blockHash, point, pointHash);
    this.pointHeap_.addPoint(point);
  }, this);

  this.pageOutIfCapacityOver_(block);
};


/**
 * @private
 * @param {!schedul.math.Box3} block
 * @param {!string} blockHash
 * @param {!goog.math.Coordinate3} point
 * @param {!string} pointHash
 */
schedul.bh.Box3Heap.prototype.addBlockPointRelation_ = function(block, blockHash, point, pointHash) {
  goog.asserts.assertString(blockHash);
  goog.asserts.assertString(pointHash);

  goog.object.setIfUndefined(this.point2block_, pointHash, {});
  this.point2block_[pointHash][blockHash] = block;

  if (!goog.object.containsKey(this.block2point_, blockHash)) {
    this.block2point_[blockHash] = {};
    this.blockSize_++;
  }
  this.block2point_[blockHash][pointHash] = point;
};


/**
 * @private
 * @param {!schedul.math.Box3} deletingBlock
 */
schedul.bh.Box3Heap.prototype.deleteBlock_ = function(deletingBlock) {
  goog.asserts.assertInstanceof(deletingBlock, schedul.math.Box3);

  var deletingBlockHash = deletingBlock.toString();
  if (!goog.object.containsKey(this.block2point_, deletingBlockHash)) {
    return;
  }

  // Find all points that are related to the deleting block
  var allPointsForDeletingBlock = this.block2point_[deletingBlockHash];
  goog.object.forEach(allPointsForDeletingBlock,
                      function(point, pointHash, obj) {
        // Remove all relations between point->deleting block
        if (!goog.object.containsKey(this.point2block_, pointHash)) {
          return;
        }
        goog.object.remove(this.point2block_[pointHash], deletingBlockHash);

        // If there are no relating blocks any more, delete point.
        if (goog.object.isEmpty(this.point2block_[pointHash])) {
          goog.object.remove(this.point2block_, pointHash);
          this.pointHeap_.forcelyRemovePoint(pointHash);
        }
      }, this);

  // Remove block relation
  goog.object.remove(this.block2point_, deletingBlockHash);
  this.blockSize_--;
  this.defaultBlockEvent_.setBlock(deletingBlock);
  this.dispatchEvent(this.defaultBlockEvent_);
};


/**
 * @param {!schedul.math.Box3} block
 * @return {!boolean}
 */
schedul.bh.Box3Heap.prototype.containsBlock = function(block) {
  goog.asserts.assertInstanceof(block, schedul.math.Box3);

  var blockHash = block.toString();
  return goog.object.containsKey(this.block2point_, blockHash);
};


/**
 * @private
 * @param {!goog.math.Coordinate3} pageOutPoint
 */
schedul.bh.Box3Heap.prototype.
    removeAllBlocksRelatedToPoint_ = function(pageOutPoint) {
  goog.asserts.assertInstanceof(pageOutPoint, goog.math.Coordinate3);

  var pageOutPointHash = pageOutPoint.toString();
  if (goog.object.containsKey(this.point2block_, pageOutPointHash)) {
    var adjacentBlocks = this.point2block_[pageOutPointHash];
    if (!goog.object.isEmpty(adjacentBlocks)) {
      goog.object.forEach(this.point2block_[pageOutPointHash],
          function(adjacentBlock, adjacentBlockHash, obj) {
            this.deleteBlock_(adjacentBlock);
          }, this);
      goog.object.remove(this.point2block_, pageOutPointHash);
    }
  }
};


/**
 * @param {!schedul.math.Box3} block
 * @return {!schedul.math.Box3}
 */
schedul.bh.Box3Heap.prototype.pageOutFarestFrom = function(block) {
  goog.asserts.assertInstanceof(block, schedul.math.Box3);

  // Find center point of block
  var centerX =
      (block.getMaxX() + block.getMinX()) >> 1;
  var centerY =
      (block.getMaxY() + block.getMinY()) >> 1;
  var centerTime = (block.getMaxTime() + block.getMinTime()) >> 1;

  var farestBlock = null;
  while (!this.pointHeap_.isEmpty()) {
    var pageOutPoint = this.pointHeap_.pageOutFarestFrom(
        centerX, centerY, centerTime);
    if (!goog.isDefAndNotNull(pageOutPoint)) {
      // page out point was null or undefined...
      break;
    }
    var pointHash = pageOutPoint.toString();
    if (goog.object.containsKey(this.point2block_, pointHash)) {
      var relatedBlocks = this.point2block_[pointHash];
      if (!goog.object.isEmpty(relatedBlocks)) {
        // Randomly choose one of the "farest" blocks and remove
        farestBlock = goog.object.getAnyValue(this.point2block_[pointHash]);
        this.deleteBlock_(farestBlock);
        if (goog.object.isEmpty(this.point2block_)) {
          goog.object.remove(this.point2block_, pointHash);
        }else if (!goog.isNull(pageOutPoint)) {
          this.pointHeap_.addPoint(pageOutPoint);
        }
      }
      break;
    }
  }
  return farestBlock;
};


/**
 * @private
 * @param {!schedul.math.Box3} block
 */
schedul.bh.Box3Heap.prototype.pageOutIfCapacityOver_ = function(block) {
  goog.asserts.assertInstanceof(block, schedul.math.Box3);

  if (this.capacity_ <= 0) {
    return;
  }

  if (this.blockSize_ > this.capacity_) {
    this.pageOutFarestFrom(block);
  }
};


/**
 * @param {!number} minX
 * @param {!number} maxX
 * @param {!number} minY
 * @param {!number} maxY
 * @param {!number} minTime
 * @param {!number} maxTime
 * @param {!Array.<!schedul.math.Box3>} resultVessel
 */
schedul.bh.Box3Heap.prototype.allBlocksTouchingRange = function(minX, maxX,
    minY, maxY, minTime, maxTime, resultVessel) {
  goog.asserts.assertNumber(minX);
  goog.asserts.assertNumber(maxX);
  goog.asserts.assertNumber(minY);
  goog.asserts.assertNumber(maxY);
  goog.asserts.assertNumber(minTime);
  goog.asserts.assertNumber(maxTime);
  goog.asserts.assertArray(resultVessel);

  this.pointSearchResultVessel_.length = 0;
  this.pointHeap_.allPointsInRange(minX, maxX, minY, maxY, minTime, maxTime,
      this.pointSearchResultVessel_);

  goog.object.clear(this.blockSearchCacheVessel_);
  goog.array.forEach(this.pointSearchResultVessel_,
      function(point, index) {
        var pointHash = point.toString();
        if (!goog.object.containsKey(this.point2block_, pointHash)) {
          return;
        }
                       goog.object.forEach(this.point2block_[pointHash],
                                           function(block, blockHash, obj) {
              this.blockSearchCacheVessel_[blockHash] = block;
            }, this);
      }, this);

  resultVessel.length = 0;
  goog.object.forEach(this.blockSearchCacheVessel_, function(block, blockHash,
      obj) {
        resultVessel.push(block);
      }, this);
};


/**
 * @param {!function(!schedul.math.Box3)} f
 * @param {S=} opt_obj The object to be used as the value of 'this' within f.
 * @template S
 */
schedul.bh.Box3Heap.prototype.forEach = function(f, opt_obj) {
  goog.object.forEach(this.block2point_, function(points, block, o) {
    f.call(opt_obj, block);
  }, this);
};


/**
 * @return {?number}
 */
schedul.bh.Box3Heap.prototype.maxX = function() {
  return this.pointHeap_.maxX();
};


/**
 * @return {?number}
 */
schedul.bh.Box3Heap.prototype.minX = function() {
  return this.pointHeap_.minX();
};


/**
 * @return {?number}
 */
schedul.bh.Box3Heap.prototype.maxY = function() {
  return this.pointHeap_.maxY();
};


/**
 * @return {?number}
 */
schedul.bh.Box3Heap.prototype.minY = function() {
  return this.pointHeap_.minY();
};


/**
 * @return {!Array.<!schedul.math.Box3>}
 */
schedul.bh.Box3Heap.prototype.dump = function() {
  var uniqueResult = {};
  goog.object.forEach(this.point2block_, function(blocks, pointHash, o) {
    goog.object.forEach(blocks, function(block, blockHash, o) {
      uniqueResult[blockHash] = block;
    },this);
  },this);

  var result = [];
  goog.object.forEach(uniqueResult, function(block, blockHash, o) {
    result.push(block);
  },this);
  return result;
};
