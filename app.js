
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , THREE = require('three.js')

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
	var scene = new THREE.Scene();



	var renderer = new THREE.CanvasRenderer();
	renderer.setSize(width, height);

	camera.position.z = 100;

	var camera_container = new THREE.Object3D();
	scene.add(camera_container);
	camera_container.add(camera);

	camera.position.z = 75;

	// Draw
	
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
