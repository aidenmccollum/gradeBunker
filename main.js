import * as THREE from 'three';

//critical variables 
var cam;
var mainChar;

//game variables
var score = 0;
var highscore = 0;

//movement variables
var moveDirection = "n";
var isJumping = false;
var clock=new THREE.Clock();
var delta=0;
var playerSpeed = 0.2;
velocity_y = 0;
var camFollow = false;

//light variables
var lights = [];
var darkMode = false;

//obstacle variables
var obstacles = [];
var blockSpeed = 0.75;

//detecting keypresses
document.onkeydown = function (event){
    switch (event.key) {      
    case "ArrowLeft":
        moveDirection = "l";
        break;
    case "ArrowRight":
        moveDirection = "r";
        break;
    case "ArrowUp":
        if (isJumping == false && blockSpeed >0) {
            isJumping = true;
            velocity_y = 11;
        }
        break;
    case "q":
        createObstacle();
        
        break;
    case "1":
        camFollow = !camFollow;
        break;
    case "2":
        darkMode = !darkMode;
        break;
    }
    
    

}

function init() {
	var scene = new THREE.Scene();

    //configuring the plane
	var plane = getPlane(400);
    var loader = new THREE.TextureLoader();

    plane.material.map = loader.load('./assets/sand.png');
    plane.material.map.wrapS = THREE.RepeatWrapping;
    plane.material.map.wrapT = THREE.RepeatWrapping;
    plane.material.map.repeat.set(400,400);


    //creating the main Character
    var dino = new THREE.Object3D();
    let leftLeg = getBox(0.125,0.125,0.125,0x1ec404);
    leftLeg.position.x = -0.125;
    let rightLeg = getBox(0.125,0.125,0.125,0x1ec404);
    rightLeg.position.x = 0.125;
    let body = getBox(0.5,0.625,0.25, 0x1ec404);
    body.position.y = 0.375;
    body.position.z = 0.125;
    let head = getBox(0.4,0.325,0.5, 0x1ec404);
    head.position.y = 0.8125;
    let tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.2,0.6,16,3),
		new THREE.MeshPhongMaterial({
		    color: 0x1ec404,
			specular: 0x002000,
			shininess: 5
		})
	);
    tail.rotation.x = Math.PI/2;
    tail.position.z = 0.25;
    tail.position.y = 0.125;
    let leftEye = getEye(0.0625,-1);
    leftEye.position.set(-0.175,0.85,0.075);
    let rightEye = getEye(0.0625,1);
    rightEye.position.set(0.175,0.85,0.075);
    dino.add(leftLeg);
    dino.add(rightLeg);
    dino.add(body);
    dino.add(head);
    dino.add(tail);
    dino.add(leftEye);
    dino.add(rightEye);


    //lights
    var ambientLight = new THREE.AmbientLight(0x42b0f5,0.3);
    var overheadLight = getDirectionalLight(0.6);
    var spotlight = getSpotlight(1);
    var headLight = getPointLight(0.6);


    //positioning
	dino.position.y = 0.125;
	plane.rotation.x = Math.PI/2;
    overheadLight.position.y = 400;
    spotlight.position.y = 5;
    spotlight.position.z = 10;
    spotlight.rotation.x = -Math.PI/12;
    headLight.position.y = 10;
    headLight.position.z = 2;

    //adding elements to scene
	scene.add(plane);
    scene.add(dino);
    scene.fog = new THREE.FogExp2(0x000000, 0.01)
    scene.add(ambientLight);
    scene.add(overheadLight);
    scene.add(spotlight);
    scene.add(headLight);
    lights = [ambientLight, overheadLight, headLight, spotlight];

    
    //camera / rendering
	var camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth/window.innerHeight,
		1,
		1000
	);

	camera.position.x = 0;
	camera.position.y = 3;
	camera.position.z = 10;
    camera.rotation.x = -Math.PI/12;
    mainChar = dino;

    camera.lookAt(new THREE.Vector3(camera.position.x, 0, 0));

	var renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
	renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x42b0f5);
	document.getElementById('webgl').appendChild(renderer.domElement);

    update(renderer, scene, camera);

	return scene;
}

function getBox(w, h, d, colorCode) {
	var geometry = new THREE.BoxGeometry(w, h, d);
	var material = new THREE.MeshPhongMaterial({
		color: colorCode
	});
	var mesh = new THREE.Mesh(
		geometry,
		material 
	);
    mesh.castShadow = true;

	return mesh;
}

function getPlane(size) {
	var geometry = new THREE.PlaneGeometry(size, size);
	var material = new THREE.MeshPhongMaterial({
		color: 0xf7c072,
		side: THREE.DoubleSide
	});
	var mesh = new THREE.Mesh(
		geometry,
		material 
	);
    mesh.receiveShadow = true;

	return mesh;
}

function getPointLight(intensity) {
    var pointlight = new THREE.PointLight(0xffffff, intensity);
    pointlight.castShadow = true;
	return pointlight;

}

function getEye(r, side) {
	var geometry = new THREE.SphereGeometry(r, 24, 24);
	var material = new THREE.MeshBasicMaterial({
		color: 'rgb(0,0,0)'
	});
	var mesh = new THREE.Mesh(
		geometry,
		material 
	);

    var pupilGeometry = new THREE.SphereGeometry(r/3,24,24);
    var pupilmaterial = new THREE.MeshBasicMaterial({
		color: 'rgb(255,255,255)'
	});
    var pupilMesh = new THREE.Mesh(
		pupilGeometry,
		pupilmaterial 
	);
    pupilMesh.position.x = r*side;
    mesh.add(pupilMesh);

	return mesh;
}

function getDirectionalLight(intensity) {
    var light = new THREE.DirectionalLight(0xffffff, intensity);
    light.castShadow = true;
    return light;
}

function getSpotlight(intensity) {
    var light = new THREE.SpotLight(0xffffff, intensity);
    light.castShadow = true;
    return light;
}


//obstacle generation
function randomWidth(){
    var newNumber = Math.floor(Math.random()*20);
    while (newNumber <= 3){
        newNumber = Math.floor(Math.random()*20);
    }
    return newNumber;
}

function createObstacle() {
    //creating hurdles
    const newObstacle = getBox(randomWidth(),1,1, 0xf7c072);
    newObstacle.position.x = (Math.random() < 0.5 ? -1 : 1)*Math.random()*16;
    newObstacle.position.y = 0.5;
    newObstacle.position.z = -200;
    scene.add(newObstacle);
    obstacles.push(newObstacle);


    window.setTimeout(createObstacle, Math.floor(Math.random()*2500));
}



//updating scene
function update(renderer, scene, camera) {
	renderer.render(
		scene,
		camera
	);
    camera.lookAt(new THREE.Vector3(camera.position.x, 0, 0));

    //determining lighting
    if (darkMode == true) {
        lights[0].intensity = 0;
        lights[1].intensity = 0;
        lights[2].intensity = 0;
        lights[3].intensity = 1;
        renderer.setClearColor(0x000000);
    } else {
        lights[0].intensity = 0.6;
        lights[1].intensity = 0.6;
        lights[2].intensity = 0.6;
        lights[3].intensity = 0;
        renderer.setClearColor(0x42b0f5);
    }

    //moving box if key is set
    if (moveDirection == "r" && mainChar.position.x < 8 && isJumping == false) {
        mainChar.position.x += playerSpeed;
        if (camFollow == true) {
            camera.position.x += playerSpeed;
        }
    } else if (moveDirection == "l" && mainChar.position.x > -8 && isJumping == false) {
        mainChar.position.x -= playerSpeed;
        if (camFollow == true) {
            camera.position.x -= playerSpeed;
        }
    }

    //processing jumps
    delta=clock.getDelta();

    mainChar.position.y += velocity_y*delta;

    if (isJumping == true) {
        velocity_y-=12.8*2*delta;
        playerSpeed -= 0.1*delta;
        //reducing side speed while in air
        if (moveDirection == "r" && mainChar.position.x < 8) {
            mainChar.position.x += playerSpeed;
            if (camFollow == true) {
                camera.position.x += playerSpeed;
            }
        } else if (moveDirection == "l" && mainChar.position.x > -8) {
            mainChar.position.x -= playerSpeed;
            if (camFollow == true) {
                camera.position.x -= playerSpeed;
            }
        }

        //resetting when hitting the ground
        if(mainChar.position.y <=0.125){
            mainChar.position.y = 0.0625;
            isJumping = false;
            velocity_y=0;
            playerSpeed = 0.2;
        } 
    }

    for (index in obstacles) {
        const block =obstacles[index];

        //moving blocks
        if (block.position.z <= 10) {
            block.position.z += blockSpeed;
        }

        //detecting collisions using bounding boxes
        firstBB = new THREE.Box3().setFromObject(mainChar);
        secondBB = new THREE.Box3().setFromObject(block);

        if (firstBB.intersectsBox(secondBB)){
            // mainChar.color.setHex(0xFF0000);
            blockSpeed = 0;
            playerSpeed = 0;
        }

        //progressing score
        if(block.position.z >= 1 && block.position.y != 0.49){
            score +=1;
            
            if (score%10 == 1){
                blockSpeed += 0.2;
            }
            
            block.position.y = 0.49;
            console.log(score);
            document.getElementById("score").innerHTML = `score: ${score}`;
        }
    }

	requestAnimationFrame(function() {
		update(renderer, scene, camera);
	})
}

var scene = init();


