var ww = window.innerWidth,
    wh = window.innerHeight;
var camera, scene, renderer;

import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/OrbitControls.js';
import {GUI} from './three/dat.gui.module.js';
import {noise} from './noise.js'
import {color} from './color.js'

const gui = new GUI();

var settings;

var planet, clouds, atmosphere;
var textureCube;

var sun, amblight;

const amplitude = 1000;
var time = 0

init();
animate();

function init() {
  //renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(ww,wh);
  document.body.appendChild(renderer.domElement);
  
  //camera
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.set( 400, 300, 300 );
  camera.lookAt(new THREE.Vector3(0,0,0));
  
  //scene
  scene = new THREE.Scene();  
  
  const controls = new OrbitControls( camera, renderer.domElement );
  
  createGUI()
  draw()
  addLights();

  window.addEventListener( 'resize', onWindowResize, false );
}


function createGUI(){
  const planetFolder = gui.addFolder('Terrain')
  const polesFolder = gui.addFolder('Poles')
  const atmosphereFolder = gui.addFolder('Atmosphere')
  // const cloudsFolder = gui.addFolder('Clouds')
  const backgroundFolder = gui.addFolder('Background (Slow)') 

  settings = {
    planet : {
      wireframe: false,
      size: 200,
      facets: 100,
      geometry: 'Icosahedron',
      noise: {
        octaves: 8,
        persistence: 0.5,
        lacunarity: 2.5,
        exponentiation: 4,
        height: 300.0,
        scale: 500.0,
        seed: 432
      },
    },
    poles:{
      enable: true,
      noise: {
        octaves: 8,
        persistence: 0.7,
        lacunarity: 3,
        exponentiation: 2.7,
        height: 250.0,
        scale: 500.0,
        seed: 451
      },
    },
    atmosphere:{
      enable: true,
      noise: {
        octaves: 8,
        persistence: 0.8,
        lacunarity: 3,
        exponentiation: 4,
        height: 40.0,
        scale: 500.0,
        seed: 451
      },
    },
    clouds:{
      enable: true,
    },
    background:{
      enable: false,
    },
    Rebuild: function(){
      draw();
    } 
  
  }
  planetFolder.add(settings.planet,'wireframe')
  planetFolder.add(settings.planet,'geometry',['Icosahedron', 'Sphere', 'Octahedron'])
  planetFolder.add(settings.planet,'size',1, 1000, 1)
  planetFolder.add(settings.planet,'facets',1, 300, 1)
  const noisePlanetFolder = planetFolder.addFolder('Noise');
  noisePlanetFolder.add(settings.planet.noise,'octaves', 1, 20, 1);
  noisePlanetFolder.add(settings.planet.noise,'persistence', 0.01, 1.0);
  noisePlanetFolder.add(settings.planet.noise,'lacunarity',1.5, 4, 0.01);
  noisePlanetFolder.add(settings.planet.noise,'exponentiation', 0.1, 10.0);
  noisePlanetFolder.add(settings.planet.noise,'height',0,2000);
  noisePlanetFolder.add(settings.planet.noise,'scale', 64.0, 4096.0);
  noisePlanetFolder.add(settings.planet.noise,'seed', 1, 2000, 1);


  polesFolder.add(settings.poles,'enable');
  const noisePolesFolder = polesFolder.addFolder('Noise');
  noisePolesFolder.add(settings.poles.noise,'persistence', 0.01, 1.0);
  noisePolesFolder.add(settings.poles.noise,'height',50,400);
  noisePolesFolder.add(settings.poles.noise,'seed', 1, 2000, 1);

  atmosphereFolder.add(settings.atmosphere,'enable');

  backgroundFolder.add(settings.background,'enable');

  gui.add(settings,'Rebuild');

}


function draw(){
  let peak = addPlanet(settings.planet.size,settings.planet.facets);
  addAtmosphere(peak,settings.planet.facets);
  
  if ( settings.background.enable ) {
    if (textureCube === undefined){
      loadTexture();
    }
    scene.background = textureCube;
  } else {
    scene.background = null;
  }
}

function loadTexture(){
  const path = 'skybox/';
  const files = [ 'right.png', 'left.png', 'top.png', 'bottom.png', 'front.png', 'back.png' ];

  textureCube = new THREE.CubeTextureLoader().setPath(path).load( files );
  textureCube.encoding = THREE.sRGBEncoding;
}

function addLights(){

  sun =  new THREE.PointLight( 0xFFE9D4, 0.85);
  sun.position.set(1000, 0, -1000);

  amblight = new THREE.AmbientLight( 0x404040,2)

  scene.add(amblight)
  scene.add(sun);
}

function addPlanet(size,facets){
  if ( planet !== undefined ) {

    planet.geometry.dispose();
    scene.remove( planet );
  }

  var geometry;
  if (settings.planet.geometry == 'Icosahedron'){
    geometry = new THREE.IcosahedronGeometry( size, facets );
  }else if((settings.planet.geometry == 'Sphere')){
    geometry = new THREE.SphereGeometry( size, facets, facets );
  }else if((settings.planet.geometry == 'Octahedron')){
    geometry = new THREE.OctahedronGeometry( size, facets );
  }

  //Itero por los vertices y agrego a la coordinada de radio un ruido
  const positionAttribute = geometry.getAttribute( 'position' );
  var vertex = new THREE.Vector3();
  var sphere_vertex = new THREE.Spherical();
  var max_peak = 0;

  const generator = new noise.Noise(settings.planet.noise,settings.planet.size);
  for ( let i = 0; i < positionAttribute.count; i ++ ) {

    vertex.fromBufferAttribute( positionAttribute, i );
    sphere_vertex.setFromVector3(vertex);
    
    let noise = generator.Get(vertex.x,vertex.y,vertex.z);
    sphere_vertex.radius += noise ;
    vertex.setFromSpherical(sphere_vertex);

    if (sphere_vertex.radius > max_peak){
      max_peak = sphere_vertex.radius;
    }

    positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z );
  }


  //Itero de nuevo, pero ahora para pintar cada vertice con la altura correspondiente, segun la altura
  geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( positionAttribute.count * 3 ), 3 ) );
  const threeColor = new THREE.Color();
  const colorAttribute = geometry.getAttribute( 'color' );
  const diff = max_peak - size;
  const colorNoise = new noise.Noise(settings.poles.noise,0);
  const colorGenerator = new color.Color(settings,colorNoise);

  for ( let i = 0; i < positionAttribute.count; i ++ ) {

    vertex.fromBufferAttribute( positionAttribute, i );
    sphere_vertex.setFromVector3(vertex);

    const rgb = colorGenerator.get((sphere_vertex.radius - size) / diff, sphere_vertex.phi, sphere_vertex.theta);

    threeColor.setRGB(rgb.r,rgb.g,rgb.b);
    colorAttribute.setXYZ(i,threeColor.r,threeColor.g,threeColor.b);
  }


  const material = new THREE.MeshStandardMaterial( {
					vertexColors: true,
          wireframe: settings.planet.wireframe,
				} );

  planet = new THREE.Mesh( geometry, material );
  planet.castShadow = true;
  planet.receiveShadow = true;
  scene.add( planet );
  return max_peak;
}

function addAtmosphere(peak,facets){
  if ( atmosphere !== undefined ) {
    atmosphere.geometry.dispose();
    scene.remove( atmosphere );
  }

  if (!settings.atmosphere.enable){
    return;
  }
  var geometry;
  facets = Math.floor(facets /4)

  if (settings.planet.geometry == 'Icosahedron'){
    geometry = new THREE.IcosahedronGeometry( peak * 1.3, facets );
  }else if((settings.planet.geometry == 'Sphere')){
    geometry = new THREE.SphereGeometry( peak * 1.3, facets, facets );
  }else if((settings.planet.geometry == 'Octahedron')){
    geometry = new THREE.OctahedronGeometry( peak * 1.3, facets );
  }

  // Itero por los vertices para generar un minimo ruido en la atmosfera
  const positionAttribute = geometry.getAttribute( 'position' );
  var vertex = new THREE.Vector3();
  var sphere_vertex = new THREE.Spherical();
  const generator = new noise.Noise(settings.atmosphere.noise,settings.planet.size);
  
  for ( let i = 0; i < positionAttribute.count; i ++ ) {

    vertex.fromBufferAttribute( positionAttribute, i ); 
    sphere_vertex.setFromVector3(vertex);   
    let noise = generator.Get(vertex.x,vertex.y,vertex.z);
    sphere_vertex.radius += noise ;
    vertex.setFromSpherical(sphere_vertex);

    positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z );
  }
  
  var material = new THREE.MeshStandardMaterial({color: 0x4ca6ff,
                                              transparent: true,
                                              opacity: 0.1,
                                             });
  atmosphere = new THREE.Mesh( geometry, material );
  scene.add( atmosphere );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );

  sunRotation();
 
  renderer.render( scene, camera );
}

function sunRotation(){
  let alpha = THREE.MathUtils.degToRad(0.08);
  time +=0.001;
  let y = amplitude * Math.sin(time);
  if (y==0){time = 0;console.log('vuelta')}

  sun.position.set(sun.position.x * Math.cos(alpha) - sun.position.z * Math.sin(alpha), y, sun.position.z * Math.cos(alpha) + sun.position.x * Math.sin(alpha))
}