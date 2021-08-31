var ww = window.innerWidth,
    wh = window.innerHeight;
var camera, scene, renderer;
var mesh;
var box;
window.on
init();
animate();
function init() {
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor(0x000000);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(ww,wh);

  document.body.appendChild(renderer.domElement);
  
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;
  camera.position.y = 200;
  camera.position.x = 123;
  camera.lookAt(new THREE.Vector3(0,0,0));
  scene = new THREE.Scene();
 // scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0022 );
  addLights();
  box = addBox(40,5);
  // sea = addSea();
  // addClouds();
  // addAtmosphere()

  window.addEventListener( 'resize', onWindowResize, false );
  // document.addEventListener( 'mousedown', onDocumentMouseDown, false );
}

function addClouds(){
  parent = new THREE.Object3D();
  parent.castShadow = true;
  scene.add( parent );
  
  for(var i = 0;i< 100; i++){
     var stick = new THREE.Object3D();
    var point = new THREE.Vector3(1 - Math.random()*2, 1-Math.random()*2, 1-Math.random()*2 );
    stick.castShadow = true;
    stick.lookAt( point );
    parent.add( stick );
  
    var cloud = cloudMesh(3,10);
    cloud.position.set( 0, 0, 150 + Math.random()*10 );
    stick.add( cloud );
  }
 
}

function cloudMesh(minSize,maxSize){
  var size = minSize + Math.random()*(maxSize-minSize);
	geometry = new THREE.SphereGeometry( size, 8, 8 );
  geometry.mergeVertices();
  geometry.vertices.forEach(function(v){
    v.x += (0-Math.random()*(size/4));
    v.y += (0-Math.random()*(size/4));
    v.z += (0-Math.random()*(size/4));
  })
  var color = '#ffffff';
 // color = ColorLuminance(color,2+Math.random()*10);
  // console.log(color);
	texture = new THREE.MeshStandardMaterial({color:color,
                                        shading: THREE.FlatShading,
                                        // shininess: 0,
                                            // roughness: 0.8,
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
  light = new THREE.HemisphereLight(0xffffff, 0xb3858c, .50);

  shadowLight =  new THREE.PointLight( 0xffffff, 2, 1000 );
//  shadowLight.shadowCameraVisible = true;
  shadowLight.shadow.camera.near = 0.5;
  shadowLight.shadow.camera.far = 2000;
  shadowLight.position.set(300, 0, 500);
  shadowLight.castShadow = true;
  shadowLight.shadow.darkness = 0.0;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  backLight = new THREE.DirectionalLight(0x0080ff, 1);
  backLight.position.set(0, 0, -500);
  backLight.shadow.darkness = 1;
  backLight.castShadow = true;

  scene.add(backLight);
 scene.add(light);
  scene.add(shadowLight);
}

function addBox(size,facets){
  var geometry = new THREE.SphereGeometry( 130, 16, 16 );
  geometry.mergeVertices();
  //var a = 15,b= 30;
  geometry.vertices.forEach(function(v){
    // var scale = 0.9+Math.random()*0.4;
    // v.multiplyScalar(scale>1.1?1.1:scale);
     Math.random()<0.6?v.multiplyScalar(0.95):v.multiplyScalar(1.1);
  })
  
  var v2 = new THREE.Vector3(0,0,0)
  geometry.vertices.forEach(function(v){
    // console.log(v.distanceTo(v2));
  })    
  
  var material = new THREE.MeshPhongMaterial({color: 0xc0b9a1,
                                            //  shading: THREE.FlatShading,
                                           //   transparent: true,
                                           //   opacity: 0.9,
                                                 shading: THREE.FlatShading,
                                     //   shininess: 0.5,
                                            // roughness: 0.8,
                                            //metalness: 1
                                         
                                     //   shininess: 0.5,
                                      //     roughness: 0.8,
                                      //      metalness: 1
                                             });
  var mesh = new THREE.Mesh( geometry, material );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );
  return mesh;
}

function addAtmosphere(){
   var geometry = new THREE.SphereGeometry( 165, 32, 32 );
  geometry.mergeVertices();
  // geometry.vertices.forEach(function(v){
  //   v.multiplyScalar(1+Math.random()*0.03);
  // })
  
  var material = new THREE.MeshPhongMaterial({color: 0x4ca6ff,
                                            //  shading: THREE.FlatShading,
                                              transparent: true,
                                              opacity: 0.2,
                                             //    shading: THREE.FlatShading,
                                        // shininess: 0.5,
                                            // roughness: 0.1,
                                            // metalness: 1
                                         
                                     //   shininess: 0.5,
                                      //     roughness: 0.8,
                                      //      metalness: 1
                                             });
  var mesh = new THREE.Mesh( geometry, material );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );
  return mesh;
}

function addSea(){
  var geometry = new THREE.SphereGeometry( 132, 32, 32 );
  geometry.mergeVertices();
  geometry.vertices.forEach(function(v){
    v.multiplyScalar(1+Math.random()*0.03);
  })
  
  var material = new THREE.MeshPhongMaterial({color: 0x4ca6ff,
                                            //  shading: THREE.FlatShading,
                                              transparent: true,
                                              opacity: 0.85,
                                                 shading: THREE.FlatShading,
                                       // shininess: 0.5,
                                        //    roughness: 0.1
                                         //   metalness: 1
                                         
                                     //   shininess: 0.5,
                                      //     roughness: 0.8,
                                      //      metalness: 1
                                             });
  var mesh = new THREE.Mesh( geometry, material );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );
  return mesh;
}
  
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
  requestAnimationFrame( animate );
  // parent.rotation.x += 0.001;
  // parent.rotation.y += 0.001;
  // mesh.rotation.x += 0.005;
  // mesh.rotation.y += 0.01;
  renderer.render( scene, camera );
}

// function onDocumentMouseDown(){
//   TweenLite.to([box.rotation,sea.rotation,parent.rotation], 1, {y:'+=6',ease:Elastic.easeOut.config(2, 0.5)});
//   console.log('click');
// }