goog.require('goog.dom');
goog.require('goog.json.Serializer');
goog.require('goog.ui.Button');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.Textarea');
goog.require('ol.TileCoord');
goog.require('schedul.bh.Box3Heap');
goog.require('schedul.math.Box3');



var b3h = new schedul.bh.Box3Heap(5);

var input = new goog.ui.LabelInput('x0/x1/y0/y1/z0/z1');
input.render(goog.dom.getElement('input'));

var insertButton = new goog.ui.Button('insert');
insertButton.render(goog.dom.getElement('insert_button'));

var dumpTextarea = new goog.ui.Textarea('');
dumpTextarea.render(goog.dom.getElement('dump'));
var jsonSerializer = new goog.json.Serializer();

goog.events.listen(insertButton,goog.ui.Component.EventType.ACTION, function(e) {
  var insertTileStr = input.getValue();
  var a = insertTileStr.trim().split('/');
  var x0 = Number(a[0]);
  var x1 = Number(a[1]);
  var y0 = Number(a[2]);
  var y1 = Number(a[3]);
  var z0 = Number(a[4]);
  var z1 = Number(a[5]);
  var tc = new ol.TileCoord(1,2,3);
  var b3 = new schedul.math.Box3(x0,x1,y0,y1,z0,z1,tc);

  b3h.addBlock(b3);

  var dumpedValue = b3h.dump();
  dumpTextarea.setValue(jsonSerializer.serialize(dumpedValue));
});
