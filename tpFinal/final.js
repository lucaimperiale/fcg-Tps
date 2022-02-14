var ww = window.innerWidth,
    wh = window.innerHeight;
var camera, scene, renderer;

import * as THREE from './three.js-master/build/three.module.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import {GUI} from './three.js-master/examples/jsm/libs/dat.gui.module.js';
import {noise} from './noise.js'
import {color} from './color.js'

const gui = new GUI();

var settings;

var planet, clouds, atmosphere;
var textureCube;

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
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
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
  const backgroundFolder = gui.addFolder('Background') 

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
        persistence: 0.5,
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
      enable: true,
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
  const urls = [ 'right.png', 'left.png', 'top.png', 'bottom.png', 'front.png', 'back.png' ];

  textureCube = new THREE.CubeTextureLoader().setPath(path).load( urls );
  textureCube.encoding = THREE.sRGBEncoding;
}

function addLights(){

  var shadowLight =  new THREE.PointLight( 0xFFEFC9, 2, 10 );
  shadowLight.shadow.camera.near = 0.5;
  shadowLight.shadow.camera.far = 2000;
  shadowLight.position.set(500, 0, 500);
  shadowLight.castShadow = true;
  shadowLight.shadow.darkness = 0.0;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  const amblight = new THREE.AmbientLight( 0x404040 ,4)

  scene.add(amblight)
  scene.add(shadowLight);
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

  const positionAttribute = geometry.getAttribute( 'position' );

  var vertex = new THREE.Vector3();
  var sphere_vertex = new THREE.Spherical();
  var max_peak = 0;


  const generator = new noise.Noise(settings.planet.noise,settings.planet.size);
  
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


  const positionAttribute = geometry.getAttribute( 'position' );
  var vertex = new THREE.Vector3();
  var sphere_vertex = new THREE.Spherical();

  const generator = new noise.Noise(settings.atmosphere.noise,settings.planet.size);
  
  for ( let i = 0; i < positionAttribute.count; i ++ ) {

    vertex.fromBufferAttribute( positionAttribute, i ); // read vertex

    sphere_vertex.setFromVector3(vertex);   
    
    let noise = generator.Get(vertex.x,vertex.y,vertex.z);

    sphere_vertex.radius += noise ;
    vertex.setFromSpherical(sphere_vertex);

    positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z ); // write coordinates back
  }
  
  var material = new THREE.MeshPhongMaterial({color: 0x4ca6ff,
                                              transparent: true,
                                              opacity: 0.05,
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
 
  renderer.render( scene, camera );
}

//Unused code

function addClouds(peak){
  if ( clouds !== undefined ) {
    scene.remove( clouds );
  }

  clouds = new THREE.Object3D();
  clouds.castShadow = true;
  scene.add( clouds );
  
  // for(var i = 0;i< 1; i++){
  //     var cloud = cloudMesh(3,10);
  //   cloud.position.set( 0, 0, peak + Math.random()*10 );
  //   cloud.position.set( 0, 0, 0 );
  //   clouds.add( cloud );
  // }

  cloudMesh(2,3)

  console.log('despues')
  console.log(clouds)
}

function cloudMesh(minSize,maxSize){
  // Texture

  const size = 128;
  const data = new Uint8Array( size * size * size );

  let i = 0;
  const scale = 0.05;
  const perlin = new ImprovedNoise();
  const vector = new THREE.Vector3();

  for ( let z = 0; z < size; z ++ ) {

    for ( let y = 0; y < size; y ++ ) {

      for ( let x = 0; x < size; x ++ ) {

        const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();
        data[ i ] = ( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
        i ++;

      }

    }

  }

  const texture = new THREE.DataTexture3D( data, size, size, size );
  texture.format = THREE.RedFormat;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;

  // Material

  const vertexShader = /* glsl */`
    in vec3 position;
    uniform mat4 modelMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec3 cameraPos;
    out vec3 vOrigin;
    out vec3 vDirection;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
      vDirection = position - vOrigin;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = /* glsl */`
    precision highp float;
    precision highp sampler3D;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    in vec3 vOrigin;
    in vec3 vDirection;
    out vec4 color;
    uniform vec3 base;
    uniform sampler3D map;
    uniform float threshold;
    uniform float range;
    uniform float opacity;
    uniform float steps;
    uniform float frame;
    uint wang_hash(uint seed)
    {
        seed = (seed ^ 61u) ^ (seed >> 16u);
        seed *= 9u;
        seed = seed ^ (seed >> 4u);
        seed *= 0x27d4eb2du;
        seed = seed ^ (seed >> 15u);
        return seed;
    }
    float randomFloat(inout uint seed)
    {
        return float(wang_hash(seed)) / 4294967296.;
    }
    vec2 hitBox( vec3 orig, vec3 dir ) {
      const vec3 box_min = vec3( - 0.5 );
      const vec3 box_max = vec3( 0.5 );
      vec3 inv_dir = 1.0 / dir;
      vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
      vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
      vec3 tmin = min( tmin_tmp, tmax_tmp );
      vec3 tmax = max( tmin_tmp, tmax_tmp );
      float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
      float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
      return vec2( t0, t1 );
    }
    float sample1( vec3 p ) {
      return texture( map, p ).r;
    }
    float shading( vec3 coord ) {
      float step = 0.01;
      return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );
    }
    void main(){
      vec3 rayDir = normalize( vDirection );
      vec2 bounds = hitBox( vOrigin, rayDir );
      if ( bounds.x > bounds.y ) discard;
      bounds.x = max( bounds.x, 0.0 );
      vec3 p = vOrigin + bounds.x * rayDir;
      vec3 inc = 1.0 / abs( rayDir );
      float delta = min( inc.x, min( inc.y, inc.z ) );
      delta /= steps;
      // Jitter
      // Nice little seed from
      // https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
      uint seed = uint( gl_FragCoord.x ) * uint( 1973 ) + uint( gl_FragCoord.y ) * uint( 9277 ) + uint( frame ) * uint( 26699 );
      vec3 size = vec3( textureSize( map, 0 ) );
      float randNum = randomFloat( seed ) * 2.0 - 1.0;
      p += rayDir * randNum * ( 1.0 / size );
      //
      vec4 ac = vec4( base, 0.0 );
      for ( float t = bounds.x; t < bounds.y; t += delta ) {
        float d = sample1( p + 0.5 );
        d = smoothstep( threshold - range, threshold + range, d ) * opacity;
        float col = shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;
        ac.rgb += ( 1.0 - ac.a ) * d * col;
        ac.a += ( 1.0 - ac.a ) * d;
        if ( ac.a >= 0.95 ) break;
        p += rayDir * delta;
      }
      color = ac;
      if ( color.a == 0.0 ) discard;
    }
  `;

  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.RawShaderMaterial( {
    glslVersion: THREE.GLSL3,
    uniforms: {
      base: { value: new THREE.Color( 0x798aa0 ) },
      map: { value: texture },
      cameraPos: { value: new THREE.Vector3() },
      threshold: { value: 0.25 },
      opacity: { value: 0.25 },
      range: { value: 0.1 },
      steps: { value: 100 },
      frame: { value: 0 }
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    transparent: true
  } );

  clouds = new THREE.Mesh( geometry, material );
  scene.add( clouds );
};