
        var scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);

        camera.position.z = 20;
        camera.position.x = 0;
       
        var renderer = new THREE.WebGLRenderer({antialias : true});

        renderer.setClearColor("#e575e5");
        
        renderer.setSize(window.innerWidth,window.innerHeight);

        document.body.appendChild(renderer.domElement);


        var geo = new THREE.BoxGeometry (10,10,4);
        var material = new THREE.MeshLambertMaterial({color: 0x49ef4});

        var mesh = new THREE.Mesh(geo, material);

        mesh.rotation.set(0.5,0.5,2);

        scene.add(mesh);

        var light = new THREE.PointLight( 0xFFFFFF,100,200 );
        light.position.set(10,0,200); 
        scene.add( light );

        renderer.render(scene,camera);