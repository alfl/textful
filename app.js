var express = require('express')
  , http = require('http')
  , path = require('path')
  , THREE = require('three.js')
  , helvetiker = require('./src/helvetiker_regular.typeface.js');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/text/:msg', function(req, res) {
	if (!req || !req.query || !res) return;
	var msg = req.param("msg") || "error";

	///// BEGIN MAGIC NUMBERS /////
	var adjustment = 1; // times depth of text (added to distance to camera).

	var fieldOfView = 90; // degrees
	var altitudeFactor = Math.abs(Math.tan((180 - fieldOfView) / 2)); // helper factor to calculate camera height
	var near = 1; // px
	var far = 100000; // px
	var width = 500; // px
	var height = 500; // px

	var textColor       = Math.random() * 0xFFFFFF;
	var backgroundColor = 0xFFFFFF ^ textColor; // Set to complement of textColor.
	var backgroundAlpha = 1;
	///// END MAGIC NUMBERS /////

	var camera = new THREE.PerspectiveCamera(fieldOfView, width / height, near, far);
	
	var scene = new THREE.Scene();

	console.log(backgroundColor.toString(16));

	var renderer = new THREE.CanvasRenderer();
	renderer.setSize(width, height);
	renderer.setClearColorHex(backgroundColor, backgroundAlpha);
	renderer.clear();

	// Load the font so we can calculate geometry.
	THREE.FontUtils.loadFace(helvetiker);

	var text3d = new THREE.TextGeometry( msg, {} );
	text3d.computeBoundingBox();

	// Calculate text and camera placement from bounding box.
	var textLength = ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );
	var textHeight = ( text3d.boundingBox.max.y - text3d.boundingBox.min.x );
	var textDepth =  ( text3d.boundingBox.max.z - text3d.boundingBox.min.z );

	// Offsets to center text in world.
	var textOffsets = {
		x: -0.5 * textLength,
		y: -0.5 * textHeight,
		z: -0.5 * textDepth
	};
	
	// Create, texture, and position text.
	var textMaterial = new THREE.MeshBasicMaterial({
		color: textColor, 
	    	overdraw: true
	});
	
	var text = new THREE.Mesh( text3d, textMaterial );

	text.position.x = textOffsets.x;
	text.position.y = textOffsets.y;
	text.position.z = textOffsets.z;

	text.rotation.x = 0;
	text.rotation.y = 0;
	text.rotation.z = 0;

	console.log("text offsets: ")
	console.log(textOffsets);

	scene.add( text );
	
	// Set the camera distance to the apex of the triange between the ends.
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = altitudeFactor * textLength / 2 + textDepth * adjustment;

	camera.rotation.x = 0;
	camera.rotation.y = 0;
	camera.rotation.z = -Math.PI / 2;

	console.log("eye position: ");
	console.log(camera.position);

	// Render canvas as image and send to the client.
	renderer.render(scene, camera);
	renderer.domElement.toBuffer(function(err, buf) {
		res.contentType('image/jpg');
		res.send(buf);
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
