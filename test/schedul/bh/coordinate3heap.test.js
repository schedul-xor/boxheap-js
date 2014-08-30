require('nclosure').nclosure({additionalDeps: ['deps.js']});
expect = require('expect.js');

goog.require('goog.math.Coordinate3');
goog.require('schedul.bh.Coordinate3Heap');

describe('schedul.bh.Coordinate3Heap', function() {
  var heap = new schedul.bh.Coordinate3Heap(3);

  var point0 = new goog.math.Coordinate3(1, 4, 1);
  heap.addPoint(point0);
  var point1 = new goog.math.Coordinate3(1, 2, -1);
  heap.addPoint(point1);
  var point2 = new goog.math.Coordinate3(9, 3, 3);
  heap.addPoint(point2);

  it('should return valid max x', function() {
    expect(heap.maxXHeap_.peek()).to.be(9);
  });

  it('should return valid max x points', function() {
    var maxx = heap.maxXHeap_.peek();
    var points = heap.maxXValue2PointMap_[maxx];
    expect(points.length).to.be(1);
    expect(points[0]).to.be(point2);
  });

  it('should return valid min x', function() {
    expect(heap.minXHeap_.peek()).to.be(1);
  });

  it('should return valid min x points', function() {
    var minx = heap.minXHeap_.peek();
    var points = heap.minXValue2PointMap_[minx];
    expect(points.length).to.be(2);
    expect(points[0]).to.be(point0);
    expect(points[1]).to.be(point1);
  });

  it('should return valid max y', function() {
    expect(heap.maxYHeap_.peek()).to.be(4);
  });

  it('should return valid max y points', function() {
    var maxy = heap.maxYHeap_.peek();
    var points = heap.maxYValue2PointMap_[maxy];
    expect(points.length).to.be(1);
    expect(points[0]).to.be(point0);
  });

  it('should return valid min y', function() {
    expect(heap.minYHeap_.peek()).to.be(2);
  });

  it('should return valid min y points', function() {
    var miny = heap.minYHeap_.peek();
    var points = heap.minYValue2PointMap_[miny];
    expect(points.length).to.be(1);
    expect(points[0]).to.be(point1);
  });

  it('should return valid max z', function() {
    expect(heap.maxZHeap_.peek()).to.be(3);
  });

  it('should return valid max z points', function() {
    var maxz = heap.maxZHeap_.peek();
    var points = heap.maxZValue2PointMap_[maxz];
    expect(points.length).to.be(1);
    expect(points[0]).to.be(point2);
  });

  it('should return valid min z', function() {
    expect(heap.minZHeap_.peek()).to.be(-1);
  });

  it('should return valid min z points', function() {
    var minz = heap.minZHeap_.peek();
    var points = heap.minZValue2PointMap_[minz];
    expect(points.length).to.be(1);
    expect(points[0]).to.be(point1);
  });
});

describe('schedul.bh.Coordinate3Heap point page-out', function() {
  var heap = new schedul.bh.Coordinate3Heap(3);

  var point0 = new goog.math.Coordinate3(1, 4, 1);
  heap.addPoint(point0);
  var point1 = new goog.math.Coordinate3(1, 2, -1);
  heap.addPoint(point1);
  var point2 = new goog.math.Coordinate3(100, 100, 100);
  heap.addPoint(point2);
  var point3 = new goog.math.Coordinate3(3, 3, 5);
  heap.addPoint(point3);
  var point4 = new goog.math.Coordinate3(2, 2, 2);
  heap.addPoint(point4);
  var point5 = new goog.math.Coordinate3(1000, 2, 2);
  heap.addPoint(point5);
  var point6 = new goog.math.Coordinate3(1001, 2, 2);
  heap.addPoint(point6);
});


describe('schedul.bh.Coordinate3Heap point search', function() {
  var heap = new schedul.bh.Coordinate3Heap(10);

  var point1 = new goog.math.Coordinate3(1, 2, 3);
  heap.addPoint(point1);
  var point2 = new goog.math.Coordinate3(1, 3, 4);
  heap.addPoint(point2);
  var point3 = new goog.math.Coordinate3(1, 3, 5);
  heap.addPoint(point3);
  var point4 = new goog.math.Coordinate3(2, 2, 3);
  heap.addPoint(point4);
  var point5 = new goog.math.Coordinate3(2, 3, 4);
  heap.addPoint(point5);
  var point6 = new goog.math.Coordinate3(2, 3, 5);
  heap.addPoint(point6);
  var point7 = new goog.math.Coordinate3(4, 3, 5);
  heap.addPoint(point7);
  var point8 = new goog.math.Coordinate3(4, 4, 5);
  heap.addPoint(point8);
  var point9 = new goog.math.Coordinate3(4, 7, 5);
  heap.addPoint(point9);
  var point10 = new goog.math.Coordinate3(4, 3, 7);
  heap.addPoint(point10);

  it('should return all points in range (exact)', function() {
    var resultVessel = [];
    heap.allPointsInRange(1, 2, 3, 3, 3, 5, resultVessel);
    expect(resultVessel.length).to.be(4);
  });

  it('should return all points in range (fuzzy)', function() {
    var resultVessel = [];
    heap.allPointsInRange(1.9, 2.1, 1.9, 2.1, 2.9, 3.1, resultVessel);
    expect(resultVessel.length).to.be(1);
  });
});
