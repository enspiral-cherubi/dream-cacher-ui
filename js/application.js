var container, stats;
var camera, controls, scene, renderer;
var pickingData = [], pickingTexture, pickingScene;
var objects = [];
var onRenderFcts = []
var highlightBox;
var defaultMaterial

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3( 10, 10, 10 );

init();
// animate();

function init() {

  container = document.getElementById( "container" );

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 100;

  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  onRenderFcts.push(controls.update)

  scene = new THREE.Scene();

  pickingScene = new THREE.Scene();
  pickingTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
  pickingTexture.minFilter = THREE.LinearFilter;
  pickingTexture.generateMipmaps = false;

  scene.add( new THREE.AmbientLight( 0x555555 ) );

  var light = new THREE.SpotLight( 0xffffff, 1.5 );
  light.position.set( 0, 500, 2000 );
  scene.add( light );

  var geometry = new THREE.Geometry(),
  pickingGeometry = new THREE.Geometry(),
  pickingMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } ),
  // defaultMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
  defaultMaterial = new THREE.MeshNormalMaterial({shading: THREE.FlatShading, wireframe: true, wireframeLinewidth: 2})

  function applyVertexColors( g, c ) {

    g.faces.forEach( function( f ) {

        var n = ( f instanceof THREE.Face3 ) ? 3 : 4;

        for( var j = 0; j < n; j ++ ) {

            f.vertexColors[ j ] = c;

        }

    } );

  }



  // var geom = new THREE.BoxGeometry( 1, 1, 1 );



  var color = new THREE.Color();

  var matrix = new THREE.Matrix4();
  var quaternion = new THREE.Quaternion();

  for ( var i = 0; i < dreamTestData.length; i ++ ) {


    // var geom = new THREE.TorusKnotGeometry(5, 200, 59, 2, 5.1, 7.83, 5.25)
    var geom = THREE.geometryChooser(dreamTestData[i].sentiment)

    // sets the position for each mesh
    var position = new THREE.Vector3();
    position.x = Math.random() * 80 - 40;
    position.y = Math.random() * 10 - 5;
    position.z = Math.random() * 80 - 40;

    // sets the rotation for each mesh
    var rotation = new THREE.Euler();
    rotation.x = Math.random() * 2 * Math.PI;
    rotation.y = Math.random() * 2 * Math.PI;
    rotation.z = Math.random() * 2 * Math.PI;

    // sets the scale for each mesh
    var scale = new THREE.Vector3();
    scale.x =  0.01;
    scale.y =  0.01;
    scale.z =  0.01;

    quaternion.setFromEuler( rotation, false );

    // the matrix has the position, scale, and rotation of the object
    matrix.compose( position, quaternion, scale );

    // give the geom's vertices a random color, to be displayed

    // applyVertexColors( geom, color.setHex( Math.random() * 0xffffff ) );

    geometry.merge( geom, matrix );

    // give the geom's vertices a color corresponding to the "id"

    applyVertexColors( geom, color.setHex( i ) );

    pickingGeometry.merge( geom, matrix );

    pickingData[ i ] = {

        position: position,
        rotation: rotation,
        scale: scale

    };

  }

   // begining position
  var sunAngle = -1/6*Math.PI*2;
  // the day duraction in seconds
  var dayDuration = 20
  // then you periodically update it
  onRenderFcts.push(function(delta, now){
      sunAngle    += delta/dayDuration * Math.PI*2
  })

  console.log(scene.children)

  ////////////////////////////////////
  //    add the starField           //
  ////////////////////////////////////

  var starField   = new THREEx.DayNight.StarField()
  scene.add( starField.object3d )
  onRenderFcts.push(function() {
    starField.update(sunAngle)
  })


  var drawnObject = new THREE.Mesh( geometry, defaultMaterial );
  scene.add( drawnObject );

  pickingScene.add( new THREE.Mesh( pickingGeometry, pickingMaterial ) );

  highlightBox = new THREE.Mesh(
      new THREE.BoxGeometry( 0.1, 0.1, 0.1 ),
      new THREE.MeshLambertMaterial( { color: 0xffff00 }
  ) );
  scene.add( highlightBox );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xffffff );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.sortObjects = false;
  container.appendChild( renderer.domElement );

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  renderer.domElement.addEventListener( 'mousemove', onMouseMove );

}

//

function onMouseMove( e ) {

  mouse.x = e.clientX;
  mouse.y = e.clientY;

}

// function animate() {

//   requestAnimationFrame( animate );

//   render();
//   stats.update();

// }

function pick() {

  //render the picking scene off-screen

  renderer.render( pickingScene, camera, pickingTexture );

  //create buffer for reading single pixel
  var pixelBuffer = new Uint8Array( 4 );

  //read the pixel under the mouse from the texture
  renderer.readRenderTargetPixels(pickingTexture, mouse.x, pickingTexture.height - mouse.y, 1, 1, pixelBuffer);

  //interpret the pixel as an ID

  var id = ( pixelBuffer[0] << 16 ) | ( pixelBuffer[1] << 8 ) | ( pixelBuffer[2] );
  var data = pickingData[ id ];

  if ( data) {

    //move our highlightBox so that it surrounds the picked object

    if ( data.position && data.rotation && data.scale ){

      highlightBox.position.copy( data.position );
      highlightBox.rotation.copy( data.rotation );
      highlightBox.scale.copy( data.scale ).add( offset );
      highlightBox.visible = true;

    }

  } else {

      highlightBox.visible = false;

  }

}

onRenderFcts.push(pick)



//////////////////////////////////////////////////////////////////////////////////
//    render the scene            //
//////////////////////////////////////////////////////////////////////////////////
onRenderFcts.push(function(){
  renderer.render( scene, camera );
})

var lastTimeMsec = null
  requestAnimationFrame(function animate(nowMsec){
    // keep looping
    requestAnimationFrame( animate );
    // measure time
    lastTimeMsec  = lastTimeMsec || nowMsec-1000/60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec  = nowMsec
    // call each update function
    onRenderFcts.forEach(function(onRenderFct){
      onRenderFct(deltaMsec/1000, nowMsec/1000)
    })

  })

// function render() {

//   controls.update();

//   pick();

//   lastTimeMsec  = lastTimeMsec || nowMsec-1000/60
//   var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
//   lastTimeMsec  = nowMsec
//   // call each update function
//   onRenderFcts.forEach(function(onRenderFct){
//     onRenderFct(deltaMsec/1000, nowMsec/1000)
//   })

//   renderer.render( scene, camera );

// }