var ww = window.innerWidth,
    wh = window.innerHeight;
var camera, scene, renderer;
var params;
window.on

import * as THREE from './three.js-master/build/three.module.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/libs/dat.gui.module.js';
import {noise} from './noise.js'
import {color} from './color.js'


init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer({antialias: true});
  // renderer.setClearColor(0x000000);
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(ww,wh);

  document.body.appendChild(renderer.domElement);
  
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;
  camera.position.y = 300;
  camera.position.x = 300;
  camera.lookAt(new THREE.Vector3(0,0,0));
  scene = new THREE.Scene();


  var backgroundTexture = new THREE.TextureLoader().load('space_background.png');
  // scene.background = backgroundTexture;

  const controls = new OrbitControls( camera, renderer.domElement );

  const gui = new GUI();



  const noiseRollup = gui.addFolder('Terrain.Noise');
    noiseRollup.add(guiParams.noise, "noiseType", ['simplex', 'perlin', 'rand']).onChange(
        onNoiseChanged);
    // noiseRollup.add(guiParams.noise, "scale", 32.0, 4096.0).onChange(
    //     onNoiseChanged);
    // noiseRollup.add(params.guiParams.noise, "octaves", 1, 20, 1).onChange(
    //     onNoiseChanged);
    // noiseRollup.add(params.guiParams.noise, "persistence", 0.25, 1.0).onChange(
    //     onNoiseChanged);
    // noiseRollup.add(params.guiParams.noise, "lacunarity", 0.01, 4.0).onChange(
    //     onNoiseChanged);
    // noiseRollup.add(params.guiParams.noise, "exponentiation", 0.1, 10.0).onChange(
    //     onNoiseChanged);
    // noiseRollup.add(params.guiParams.noise, "height", 0, 512).onChange(
    //     onNoiseChanged);

    // params.guiParams.heightmap = {
    //   height: 16,
    // };
  

  // scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0022 );
  addLights();
  var peak = addPlanet(200,5);
  addClouds(peak);
  // addAtmosphere(peak)
  // createstars();

  window.addEventListener( 'resize', onWindowResize, false );
}

function addClouds(peak){
  var parent = new THREE.Object3D();
  parent.castShadow = true;
  scene.add( parent );
  
  for(var i = 0;i< 100; i++){
    var stick = new THREE.Object3D();
    var point = new THREE.Vector3(1 - Math.random()*2, 1-Math.random()*2, 1-Math.random()*2);
    stick.castShadow = true;
    stick.lookAt( point );
    parent.add( stick );
  
    var cloud = cloudMesh(3,10);
    cloud.position.set( 0, 0, peak + Math.random()*10 );
    stick.add( cloud );
  }
 
}

function cloudMesh(minSize,maxSize){
  var size = minSize + Math.random()*(maxSize-minSize);
	var geometry = new THREE.SphereGeometry( size, 8, 8 );
  const positionAttribute = geometry.getAttribute( 'position' );
  var vertex = new THREE.Vector3();


  for ( let i = 0; i < positionAttribute.count; i ++ ) {
    vertex.fromBufferAttribute( positionAttribute, i ); // read vertex

    vertex.x += (0-Math.random()*(size/4));
    vertex.y += (0-Math.random()*(size/4));
    vertex.z += (0-Math.random()*(size/4));

    positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z ); // write coordinates back
  }
  var color = '#ffffff';
 // color = ColorLuminance(color,2+Math.random()*10);
  // console.log(color);
	var texture = new THREE.MeshStandardMaterial({color:color,
                                        // shading: THREE.FlatShading,
                                        // shininess: 0,
                                            roughness: 0.8,
                                     //       metalness: 1
                                        });

	var cloud = new THREE.Mesh(geometry, texture);
  cloud.scale.set(1+Math.random()*0.4,1+Math.random()*1,0.3 + Math.random()*0.3);
  cloud.castShadow = true;
  cloud.receiveShadow = true;
//  cube.scale.set(1+Math.random()*0.4,1+Math.random()*0.8,1+Math.random()*0.4);
  return cloud;
};

function addLights(){

  var shadowLight =  new THREE.PointLight( 0xffffff, 2, 1000 );
//  shadowLight.shadowCameraVisible = true;
  shadowLight.shadow.camera.near = 0.5;
  shadowLight.shadow.camera.far = 2000;
  shadowLight.position.set(300, 0, 500);
  shadowLight.castShadow = true;
  shadowLight.shadow.darkness = 0.0;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  var backLight = new THREE.DirectionalLight(0x0080ff, 1);
  backLight.position.set(0, 0, -500);
  backLight.shadow.darkness = 1;
  backLight.castShadow = true;

  const amblight = new THREE.AmbientLight( 0x404040 ,4)


  scene.add(amblight)
  // scene.add(backLight);
  // scene.add(shadowLight);
}

function createstars() {

  var pts = [];
  let outerLimit = 5000;
  let innerLimit = 1000;
  let mainR = 1000;


  for(let i = 0; i < 10000; i++){

    let inout = (Math.random() - 0.5) * 2;
    let lim = (inout >= 0 ? outerLimit : innerLimit);
    let rand = mainR + Math.pow(Math.random(), 3) * lim * inout;
  
    pts.push(
        new THREE.Vector3().setFromSphericalCoords (
          rand,
          Math.PI * 2 * Math.random(),
          Math.PI * 2 * Math.random()
      )
    )
  }
  var g = new THREE.BufferGeometry().setFromPoints(pts);
  var m = new THREE.PointsMaterial({color: "white"});
  var mesh = new THREE.Points(g,m);

  scene.add(mesh)

}

function addPlanet(size,facets){
  var geometry = new THREE.SphereGeometry( size, 200, 200 );

  const positionAttribute = geometry.getAttribute( 'position' );

  var vertex = new THREE.Vector3();
  var sphere_vertex = new THREE.Spherical();
  var max_peak = 0;

  let params = {
    octaves: 8,
    persistence: 0.5,
    lacunarity: 2.5,
    exponentiation: 4,
    height: 200.0,
    scale: 500.0,
    noiseType: 'perlin',
    seed: 432
  };

  var generator = new noise.Noise(params);
  
  for ( let i = 0; i < positionAttribute.count; i ++ ) {

    vertex.fromBufferAttribute( positionAttribute, i ); // read vertex

    sphere_vertex.setFromVector3(vertex);   
    
    let noise = generator.Get(vertex.x,vertex.y,vertex.z);

    sphere_vertex.radius += noise ;
    vertex.setFromSpherical(sphere_vertex);

    if (sphere_vertex.radius > max_peak){
      max_peak = sphere_vertex.radius;
    }

    positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z ); // write coordinates back
  }

  geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( positionAttribute.count * 3 ), 3 ) );

  const threeColor = new THREE.Color();

  const colorAttribute = geometry.getAttribute( 'color' );

  const diff = max_peak - size;

  var colorGenerator = new color.Color();

  for ( let i = 0; i < positionAttribute.count; i ++ ) {

    vertex.fromBufferAttribute( positionAttribute, i ); // read vertex

    sphere_vertex.setFromVector3(vertex);

    const rgb = colorGenerator.get((sphere_vertex.radius - size) / diff, sphere_vertex.phi, sphere_vertex.theta);

    threeColor.setRGB(rgb.r,rgb.g,rgb.b);

    colorAttribute.setXYZ(i,threeColor.r,threeColor.g,threeColor.b);
  }


  const material = new THREE.MeshToonMaterial( {
					color: 0xffffff,
					vertexColors: true,
          // wireframe: true,
				} );

  var mesh = new THREE.Mesh( geometry, material );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );
  return max_peak;
}


function addAtmosphere(peak){
  var geometry = new THREE.SphereGeometry( peak*1.2, 32, 32 );


  const positionAttribute = geometry.getAttribute( 'position' );
  var vertex = new THREE.Vector3();

  for ( let i = 0; i < positionAttribute.count; i ++ ) {
    vertex.fromBufferAttribute( positionAttribute, i ); // read vertex

    vertex.multiplyScalar(1+Math.random()*0.03);

    positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z ); // write coordinates back
  }
  
  var material = new THREE.MeshPhongMaterial({color: 0x4ca6ff,
                                              transparent: true,
                                              opacity: 0.1,
                                             });
  var mesh = new THREE.Mesh( geometry, material );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
  requestAnimationFrame( animate );

  // controls.update();
  
  renderer.render( scene, camera );
}
