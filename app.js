var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
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

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/text', function(req, res) {
	// Render Hello World and send back image.
	var width = 500;
	var height = 500;
	var msg = "Hello World";

	var camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
	camera.position.z = 900;
	
	var scene = new THREE.Scene();
	var renderer = new THREE.CanvasRenderer();
	renderer.setSize(width, height);
	renderer.setClearColor(0x000000, 1);

	var fontData = THREE.FontUtils.loadFace(helvetiker);

	var text3d = new THREE.TextGeometry( msg, {} );
	text3d.computeBoundingBox();
	console.log(text3d.boundingBox);
	
	var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

	var textMaterial = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, overdraw: true } );
	
	var text = new THREE.Mesh( text3d, textMaterial );
	text.position.x = centerOffset;
	text.position.y = 100;
	text.position.z = 0;
	text.rotation.x = 0;
	text.rotation.y = Math.PI * 2;

	var group = new THREE.Object3D();
	group.add( text );
	scene.add( group );

	// Output
	renderer.render(scene, camera);
	renderer.domElement.toBuffer(function(err, buf) {
		res.contentType('image/jpg');
		res.send(buf);
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
