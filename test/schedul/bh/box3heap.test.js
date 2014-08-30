require('nclosure').nclosure({additionalDeps: ['deps.js']});
expect = require('expect.js');

goog.require('goog.object');
goog.require('goog.math.Coordinate3');
goog.require('ol.TileCoord');
goog.require('schedul.bh.Box3Heap');
goog.require('schedul.bh.Box3HeapEvent');
goog.require('schedul.math.Box3');

describe('schedul.bh.Box3Heap with 1 block', function() {
  var heap = new schedul.bh.Box3Heap(3);

  var tilecoord = new ol.TileCoord(13, 25, 46);
  var block0 = new schedul.math.Box3(1, 2, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block0);

  /*
   * +-+
   * | |
   * +-+
   */
  it('should have 9 vertices registered', function() {
    expect(goog.object.getCount(heap.point2block_)).to.be(9);
  });
  it('should contain vertices that are all looking at the block', function() {
    goog.object.forEach(heap.point2block_, function(blocks, pointHeap, obj) {
      expect(blocks[block0.toString()] !== undefined).to.be(true);
    },this);
  });
  it('should have 1 block registered', function() {
    expect(goog.object.getCount(heap.block2point_)).to.be(1);
  });
  it('should have blocksize set to 1', function() {
    expect(heap.blockSize_).to.be(1);
  });
  it('should return existance', function() {
    expect(heap.containsBlock(block0)).to.be(true);
  });
});

/*
 * +-+-+
 * | | |
 * +-+-+
 */
describe('schedul.bh.Box3Heap with 2 blocks', function() {
  var heap = new schedul.bh.Box3Heap(3);

  var tilecoord = new ol.TileCoord(13, 25, 46);
  var block0 = new schedul.math.Box3(1, 2, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block0);
  var block1 = new schedul.math.Box3(1, 2, 14, 15, 25, 26, tilecoord);
  heap.addBlock(block1);
  it('should have 14 vertices registered', function() {
    expect(goog.object.getCount(heap.point2block_)).to.be(14);
  });
  it('should have 2 blocks registered', function() {
    expect(goog.object.getCount(heap.block2point_)).to.be(2);
  });
  it('should have blocksize set to 2', function() {
    expect(heap.blockSize_).to.be(2);
  });
});

/*
 * +-+-+
 * | | |
 * +-+-+
 * | |
 * +-+
 */
describe('schedul.bh.Box3Heap with 3 blocks', function() {
  var heap = new schedul.bh.Box3Heap(3);

  var tilecoord = new ol.TileCoord(13, 25, 46);
  var block0 = new schedul.math.Box3(1, 2, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block0);
  var block1 = new schedul.math.Box3(1, 2, 14, 15, 25, 26, tilecoord);
  heap.addBlock(block1);
  var block2 = new schedul.math.Box3(2, 3, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block2);
  it('should have 19 vertices registered', function() {
    expect(goog.object.getCount(heap.point2block_)).to.be(19);
  });
  it('should have 3 blocks registered', function() {
    expect(goog.object.getCount(heap.block2point_)).to.be(3);
  });
  it('should have blocksize set to 3', function() {
    expect(heap.blockSize_).to.be(3);
  });
});

/*
 * +-+-+
 * | |X|
 * +-+-+
 * | |
 * +-+
 * | |
 * +-+
 */
describe('schedul.bh.Box3Heap with 4 blocks, which swaps out 1', function() {
  var heap = new schedul.bh.Box3Heap(3);

  var tilecoord = new ol.TileCoord(13, 25, 46);
  var block0 = new schedul.math.Box3(1, 2, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block0);
  var block1 = new schedul.math.Box3(1, 2, 14, 15, 25, 26, tilecoord);
  heap.addBlock(block1);
  var block2 = new schedul.math.Box3(2, 3, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block2);
  var block3 = new schedul.math.Box3(3, 4, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block3);

  it('should have 19 vertices registered', function() {
    expect(goog.object.getCount(heap.point2block_)).to.be(19);
  });
  it('should have 3 blocks registered', function() {
    expect(goog.object.getCount(heap.block2point_)).to.be(3);
  });
  it('should have blocksize set to 3', function() {
    expect(heap.blockSize_).to.be(3);
  });
});

/*
 * +-+-+
 * |X|X|
 * +-X-+
 * |X|
 * +-+
 * | |
 * +-+
 */
describe('schedul.bh.Box3Heap with 4 blocks, and forcely remove point in center', function() {
  var heap = new schedul.bh.Box3Heap(10);

  var tilecoord = new ol.TileCoord(13, 25, 46);
  var block0 = new schedul.math.Box3(1, 2, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block0);
  var block1 = new schedul.math.Box3(1, 2, 14, 15, 25, 26, tilecoord);
  heap.addBlock(block1);
  var block2 = new schedul.math.Box3(2, 3, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block2);
  var block3 = new schedul.math.Box3(3, 4, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block3);

  heap.removeAllBlocksRelatedToPoint_(new goog.math.Coordinate3(2, 14, 26));

  it('should have 9 vertices registered', function() {
    expect(goog.object.getCount(heap.point2block_)).to.be(9);
  });
  it('should have 1 block registered', function() {
    expect(goog.object.getCount(heap.block2point_)).to.be(1);
  });
  it('should have blocksize set to 1', function() {
    expect(heap.blockSize_).to.be(1);
  });
});


describe('schedul.bh.Box3Heap search', function() {
  var heap = new schedul.bh.Box3Heap(10);

  var tilecoord = new ol.TileCoord(13, 25, 46);
  var block0 = new schedul.math.Box3(1, 2, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block0);
  var block1 = new schedul.math.Box3(1, 2, 14, 15, 25, 26, tilecoord);
  heap.addBlock(block1);
  var block2 = new schedul.math.Box3(2, 3, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block2);
  var block3 = new schedul.math.Box3(3, 4, 13, 14, 25, 26, tilecoord);
  heap.addBlock(block3);
  var block4 = new schedul.math.Box3(3, 4, 12, 13, 25, 26, tilecoord);
  heap.addBlock(block3);
  var block5 = new schedul.math.Box3(4, 5, 13, 14, 26, 27, tilecoord);
  heap.addBlock(block3);

  it('should return all touching blocks in range', function() {
    var resultVessel = [];
    heap.allBlocksTouchingRange(2, 3, 13, 14, 25, 26, resultVessel);
  });
});
