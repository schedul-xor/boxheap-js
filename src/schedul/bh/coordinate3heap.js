goog.provide('schedul.bh.Coordinate3Heap');

goog.require('goog.asserts');
goog.require('goog.events.EventTarget');
goog.require('goog.math.Coordinate3');
goog.require('goog.object');
goog.require('schedul.bh.Coordinate3HeapEvent');
goog.require('schedul.bh.Coordinate3HeapEventType');
goog.require('schedul.pq.Base');
goog.require('schedul.pq.Binary');
goog.require('ubilabs.KDTree');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {!number} capacity
 */
schedul.bh.Coordinate3Heap = function(capacity) {
  goog.base(this);
  goog.asserts.assertNumber(capacity);

  this.maxXHeap_ = new schedul.pq.Binary(schedul.pq.Base.max);
  this.maxXValue2PointMap_ = {};
  this.minXHeap_ = new schedul.pq.Binary(schedul.pq.Base.min);
  this.minXValue2PointMap_ = {};

  this.maxYHeap_ = new schedul.pq.Binary(schedul.pq.Base.max);
  this.maxYValue2PointMap_ = {};
  this.minYHeap_ = new schedul.pq.Binary(schedul.pq.Base.min);
  this.minYValue2PointMap_ = {};

  this.maxZHeap_ = new schedul.pq.Binary(schedul.pq.Base.max);
  this.maxZValue2PointMap_ = {};
  this.minZHeap_ = new schedul.pq.Binary(schedul.pq.Base.min);
  this.minZValue2PointMap_ = {};

  this.pointXyts_ = {};
  this.pointXytCount_ = 0;
  this.maxPointXytCount_ = capacity;

  this.index_ = new ubilabs.KDTree();
  this.limitsVessel_ = new Array(6);

  this.defaultPointEvent_ = new schedul.bh.Coordinate3HeapEvent(schedul.bh.Coordinate3HeapEventType.POINT_WIPED, null);
};
goog.inherits(schedul.bh.Coordinate3Heap, goog.events.EventTarget);


/**
 * @param {!goog.math.Coordinate3} point
 */
schedul.bh.Coordinate3Heap.prototype.addPoint = function(point) {
  goog.asserts.assertInstanceof(point, goog.math.Coordinate3);

  var x = point.x;
  this.add_(x, point, this.maxXValue2PointMap_, this.maxXHeap_);
  this.add_(x, point, this.minXValue2PointMap_, this.minXHeap_);
  var y = point.y;
  this.add_(y, point, this.maxYValue2PointMap_, this.maxYHeap_);
  this.add_(y, point, this.minYValue2PointMap_, this.minYHeap_);
  var z = point.z;
  this.add_(z, point, this.maxZValue2PointMap_, this.maxZHeap_);
  this.add_(z, point, this.minZValue2PointMap_, this.minZHeap_);

  var pointHash = point.toString();
  if (!goog.object.containsKey(this.pointXyts_, pointHash)) {
    this.pointXyts_[pointHash] = point;
    this.pointXytCount_++;
  }

  this.index_.insert(point);

  this.pageOutIfCapacityOver_(point);
};


/**
 * @private
 * @param {!number} value
 * @param {!goog.math.Coordinate3} point
 * @param {!Object.<!number, !Array.<!goog.math.Coordinate3>>} map
 * @param {!schedul.pq.Base} heap
 */
schedul.bh.Coordinate3Heap.prototype.add_ = function(value, point, map, heap) {
  goog.asserts.assertNumber(value);
  goog.asserts.assertInstanceof(point, goog.math.Coordinate3);
  goog.asserts.assertObject(map);
  goog.asserts.assertInstanceof(heap, schedul.pq.Base);

  if (!goog.object.containsKey(map, value)) {
    map[value] = [];
  }
  map[value].push(point);
  heap.push(value);
};


/**
 * @private
 * @param {!Object.<!number, !Array.<!goog.math.Coordinate3>>} map
 * @param {!schedul.pq.Base} heap
 * @return {?Array.<!goog.math.Coordinate3>}
 */
schedul.bh.Coordinate3Heap.prototype.points_ = function(map, heap) {
  goog.asserts.assertObject(map);
  goog.asserts.assertInstanceof(heap, schedul.pq.Base);

  var v;
  while (true) {
    v = heap.peek();
    if (goog.isDefAndNotNull(v) && goog.isDefAndNotNull(map[v])) {
      return map[v];
    }
    heap.pop();
  }
};


/**
 * @private
 * @param {!Object.<!number, !Array.<!goog.math.Coordinate3>>} heapValue2RelatedPoints
 * @param {!schedul.pq.Base} heap
 * @return {?goog.math.Coordinate3}
 */
schedul.bh.Coordinate3Heap.prototype.
    popPointFromHeap_ = function(heapValue2RelatedPoints, heap, type) {
  goog.asserts.assertObject(heapValue2RelatedPoints);
  goog.asserts.assertInstanceof(heap, schedul.pq.Base);

  var poppedHeapValue;
  var point = null;
  var heapLimit = heap.size();
  var poppedFromHeapPointCount = 0;
  while (heapLimit--> 0) {
    poppedHeapValue = heap.pop();
    if (goog.isNull(poppedHeapValue)) {
      continue;
    }

    if (!goog.object.containsKey(heapValue2RelatedPoints, poppedHeapValue))
    {
      continue;
    }
    var points = heapValue2RelatedPoints[poppedHeapValue];
    var relatedPointsLimit = points.length;
    while (relatedPointsLimit--> 0) {
      point = points.pop();
      var pointHash = point.toString();
      if (goog.object.containsKey(this.pointXyts_, pointHash)) {
        // Point for popped heap value was found! This point will be popped!
        break;
      }
      point = null;
    }
    if (points.length === 0) {
      goog.object.remove(heapValue2RelatedPoints, poppedHeapValue);
    }else {
      heap.push(poppedHeapValue);
    }
    if (!goog.isNull(point)) {
      break;
    }
  }
  return point;
};


/**
 * @private
 * @param {!Object.<!number, !Array.<!goog.math.Coordinate3>>} map
 * @param {!schedul.pq.Base} heap
 * @return {?goog.math.Coordinate3}
 */
schedul.bh.Coordinate3Heap.prototype.max_ = function(map, heap) {
  goog.asserts.assertObject(map);
  goog.asserts.assertInstanceof(heap, schedul.pq.Base);

  return null;
};


/**
 * @param {!number} pointHash
 */
schedul.bh.Coordinate3Heap.prototype.forcelyRemovePoint = function(pointHash) {
  if (goog.object.containsKey(this.pointXyts_, pointHash)) {
    goog.object.remove(this.pointXyts_, pointHash);
    this.pointXytCount_--;
  }
};


/**
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {?goog.math.Coordinate3}
 */
schedul.bh.Coordinate3Heap.prototype.pageOutFarestFrom = function(x, y, z) {
  goog.asserts.assertNumber(x);
  goog.asserts.assertNumber(y);
  goog.asserts.assertNumber(z);
  goog.asserts.assert(this.pointXytCount_ > 0,
      'tried to page out from empty heap.');


  var farestPoint = null;
  var limit = 1;//this.pointXytCount_;
  while (limit--> 0) {
    var maxx = this.maxXHeap_.peek();
    var minx = this.minXHeap_.peek();
    var maxy = this.maxYHeap_.peek();
    var miny = this.minYHeap_.peek();
    var maxt = this.maxZHeap_.peek();
    var mint = this.minZHeap_.peek();

    var maxXDelta = maxx - x;
    var minXDelta = x - minx;
    var maxYDelta = maxy - y;
    var minYDelta = y - miny;
    var maxZDelta = maxt - z;
    var minZDelta = z - mint;

    var delta = 0;
    if (maxXDelta > delta) {delta = maxXDelta;}
    if (minXDelta > delta) {delta = minXDelta;}
    if (maxYDelta > delta) {delta = maxYDelta;}
    if (minYDelta > delta) {delta = minYDelta;}
    if (maxZDelta > delta) {delta = maxZDelta;}
    if (minZDelta > delta) {delta = minZDelta;}
    if (delta === maxXDelta) {
      farestPoint = this.popPointFromHeap_(this.maxXValue2PointMap_, this.
          maxXHeap_, 'maxx');
    }else if (delta === minXDelta) {
      farestPoint = this.popPointFromHeap_(this.minXValue2PointMap_, this.
          minXHeap_, 'minx');
    }else if (delta === maxYDelta) {
      farestPoint = this.popPointFromHeap_(this.maxYValue2PointMap_, this.
          maxYHeap_, 'maxy');
    }else if (delta === minYDelta) {
      farestPoint = this.popPointFromHeap_(this.minYValue2PointMap_, this.
          minYHeap_, 'miny');
    }else if (delta === maxZDelta) {
      farestPoint = this.popPointFromHeap_(this.maxZValue2PointMap_, this.
          maxZHeap_, 'maxz');
    }else if (delta === minZDelta) {
      farestPoint = this.popPointFromHeap_(this.minZValue2PointMap_, this.
          minZHeap_, 'minz');
    }else {
      goog.asserts.fail('Nothing matched? impossible!');
    }
    if (!goog.isNull(farestPoint)) {
      break;
    }
  }
  if (goog.isDefAndNotNull(farestPoint)) {
    var hash = farestPoint.toString();
    goog.object.remove(this.pointXyts_, hash);
    this.pointXytCount_--;
    this.index_.remove(farestPoint);
  }
  return farestPoint;
};


/**
 * @private
 * @param {!goog.math.Coordinate3} point
 */
schedul.bh.Coordinate3Heap.prototype.pageOutIfCapacityOver_ = function(point) {
  goog.asserts.assertInstanceof(point, goog.math.Coordinate3);

  var limit = this.pointXytCount_;
  while (this.pointXytCount_ > this.maxPointXytCount_ && limit--> 0) {
    var pageOutPoint = this.pageOutFarestFrom(point.x, point.y, point.z);
    if (!goog.isDefAndNotNull(pageOutPoint)) { break; }
  }
};


/**
 * @param {!number} minX
 * @param {!number} maxX
 * @param {!number} minY
 * @param {!number} maxY
 * @param {!number} minZ
 * @param {!number} maxZ
 * @param {!Array.<!goog.math.Coordinate3>} resultVessel
 */
schedul.bh.Coordinate3Heap.prototype.allPointsInRange = function(minX, maxX, minY,
    maxY,
    minZ, maxZ, resultVessel) {
  goog.asserts.assertNumber(minX);
  goog.asserts.assertNumber(maxX);
  goog.asserts.assertNumber(minY);
  goog.asserts.assertNumber(maxY);
  goog.asserts.assertNumber(minZ);
  goog.asserts.assertNumber(maxZ);
  goog.asserts.assertArray(resultVessel);

  this.limitsVessel_.length = 0;
  this.limitsVessel_.push(minX);
  this.limitsVessel_.push(maxX);
  this.limitsVessel_.push(minY);
  this.limitsVessel_.push(maxY);
  this.limitsVessel_.push(minZ);
  this.limitsVessel_.push(maxZ);
  this.index_.allPointsInRange(this.limitsVessel_, resultVessel);
};


/**
 * @return {!boolean}
 */
schedul.bh.Coordinate3Heap.prototype.isEmpty = function() {
  return this.pointXytCount_ === 0;
};


/**
 * @return {?number}
 */
schedul.bh.Coordinate3Heap.prototype.maxX = function() {
  return this.maxXHeap_.peek();
};


/**
 * @return {?number}
 */
schedul.bh.Coordinate3Heap.prototype.minX = function() {
  return this.minXHeap_.peek();
};


/**
 * @return {?number}
 */
schedul.bh.Coordinate3Heap.prototype.maxY = function() {
  return this.maxYHeap_.peek();
};


/**
 * @return {?number}
 */
schedul.bh.Coordinate3Heap.prototype.minY = function() {
  return this.minYHeap_.peek();
};