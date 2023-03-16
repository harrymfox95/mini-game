import * as THREE from "three";
import * as Tone from "tone";
import { RunnerModelLoader, CollectableModelLoader } from "./loadModel.js";
import {
  Environment,
  Avatar,
  TreeObstacle,
  SphereObstacle
} from "./runnerObjects";
import { KeyboardService } from "./keyboard.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./styles.css";
import { LightShadow } from "three";
import { BackingTrack } from "./sounds.js";

let scene, camera, renderer;
let colour, intensity, light;
let ambientLight;

let orbit;

let sceneHeight, sceneWidth;

let clock, delta, interval;

let backingTrack;

let avatarModelLoader, avatarModel;
let speed,
  avatar,
  ground,
  obstacles,
  spheres,
  numObstacles,
  numSpheres;
let keyboard;
let startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

function init() {
  // remove overlay
  let overlay = document.getElementById("overlay");
  overlay.remove();
  Tone.start();
  Tone.Transport.start();
  //backingTrack = new BackingTrack();
  //backingTrack = false;
  //create our clock and set interval at 30 fpx
  clock = new THREE.Clock();
  delta = 0;
  interval = 1 / 2;

  //create our scene
  sceneWidth = window.innerWidth;
  sceneHeight = window.innerHeight;
  scene = new THREE.Scene();
  //task 2 part 2 in here
  scene.background = new THREE.Color(0x00000); // Set white background
  scene.fog = new THREE.FogExp2(0x11111, 0.004); //Create some fog for VFX
  //create camera
  camera = new THREE.PerspectiveCamera(
    75,
    sceneWidth / sceneHeight,
    0.1,
    10000
  );

  camera.position.z = 45;
  camera.position.y = 25;

  //specify our renderer and add it to our document
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); //renderer with transparent backdrop
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; //enable shadow
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  //create the orbit controls instance so we can use the mouse move around our scene
  orbit = new OrbitControls(camera, renderer.domElement);

  orbit.enabled = true; //disable orbit controls

  // lighting
  colour = 0xffffff; // white
  intensity = 0.8; // 80% intensity
  light = new THREE.DirectionalLight(colour, intensity); // create new directional light
  //Task 2 part 1 in here
  light.position.set(-20, 50, -5); //set the light's initial position
  light.castShadow = true; //ensure that this light will cast a shadow
  //Please read here for some more information about the below: https://threejs.org/docs/#api/en/lights/shadows/DirectionalLightShadow
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 5000;
  light.shadow.camera.left = -500;
  light.shadow.camera.bottom = -500;
  light.shadow.camera.right = 500;
  light.shadow.camera.top = 500;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;

  scene.add(light);
  ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);

  speed = 2.5;
  //Task 3 part 1 in here
  avatar = new Avatar(scene);
  avatarModelLoader = new RunnerModelLoader("Jet", new THREE.Vector3(0, 10, 0));
  avatarModel = avatarModelLoader.loadModel(scene, avatar);

  //Task 1 part 1
  ground = new Environment(scene);

  keyboard = new KeyboardService();

  avatar.score = 0;

  numObstacles = 35;
  numSpheres = 25;
  obstacles = [];
  spheres = [];

  //task 3 part 4 in here
  light.target = avatar.hero;
  document.addEventListener("keydown", documentKeyDown, false);
  document.addEventListener("keyup", documentKeyUp, false);
  window.addEventListener("resize", onWindowResize, false); //resize callback
  //task 4 part 2 in here
  createTrees(avatar, ground);
  createSpheres(avatar, ground);
  play();
}

//task 4 part 1 in here
function createTrees(avatar, ground) {
  for (let i = 0; i < numObstacles; i++) {
    // loop through untill we reach numObstacles
    let randPosX = THREE.MathUtils.randInt(-200, 200); // generate a random position to be used in x axis
    let randPosZ = THREE.MathUtils.randInt(-1000, 1000); // generate a random position to be used in z axis

    obstacles.push(new TreeObstacle(randPosX, 7, randPosZ, scene)); // add a new tree to our obstacles array, pass in random x & z values, leeping them at 7 on the y axis so that they sit nicely on the ground plane
  }
}

function createSpheres(avatar, ground) {
  for (let i = 0; i < numSpheres; i++) {
    // loop through untill we reach numObstacles
    let randPosX = THREE.MathUtils.randInt(-200, 200); // generate a random position to be used in x axis
    let randPosZ = THREE.MathUtils.randInt(-1000, 1000); // generate a random position to be used in z axis
    spheres.push(new SphereObstacle(randPosX, 7, randPosZ, scene)); // add a new tree to our obstacles array, pass in random x & z values, leeping them at 7 on the y axis so that they sit nicely on the ground plane
  }
}

//task 5 part 1 in here
function moveTrees() {
  for (let i = 0; i < obstacles.length; i++) {
    // interate through obstaces array
    let meshGroup = obstacles[i].obstacle; // create a lcal variable and assign our meshGroup of cones conatianed within the tree obstace to it

    // respawn
    if (meshGroup.position.z > camera.position.z) {
      // is the obstacle behind us?
      obstacles[i].reset(); // call the rest function to move our obstacle and change its colour to green
    }
  }
}

function moveSpheres() {
  for (let i = 0; i < spheres.length; i++) {
    // interate through obstaces array
    let meshGroup = spheres[i].sphere; // create a lcal variable and assign our meshGroup of cones conatianed within the tree obstace to it

    // respawn
    if (meshGroup.position.z > camera.position.z) {
      // is the obstacle behind us?
      spheres[i].reset(); // call the rest function to move our obstacle and change its colour to green
    }
  }
}

// stop animating (not currently used)
function stop() {
  renderer.setAnimationLoop(null);
}

// simple render function

function render() {
  renderer.render(scene, camera);
}

// start animating

function play() {
  //using the new setAnimationLoop method which means we are WebXR ready if need be
  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}

//our update function

function update() {
  //update stuff in here
  delta += clock.getDelta();

  //Task 3 part 2 in here
  camera.position.z -= speed; //move camera through scene by subtracting speed from its current position
  light.position.copy(camera.position); //use the camera's position to update the directional light's position by copying the cameras position in vector3
  light.position.y += 1500; //ensure light then stays high above
  light.position.z -= 1500; //ensure light then stays in the distance shining back at us
  avatar.update(speed, obstacles, spheres, keyboard);
  ground.update(camera);
  if (delta > interval) {
    // The draw or time dependent code are here
    if (avatarModelLoader.modelLoaded === true && avatar.heroModel === false) {
      avatar.setModel(avatarModel);
    }

    moveTrees();
    moveSpheres();
    delta = delta % interval;
  }
}

function onWindowResize() {
  //resize & align
  sceneHeight = window.innerHeight;
  sceneWidth = window.innerWidth;
  renderer.setSize(sceneWidth, sceneHeight);
  camera.aspect = sceneWidth / sceneHeight;
  camera.updateProjectionMatrix();
}

function documentKeyDown(event) {
  let keyCode = event.keyCode;
  keyboard.keys[keyCode] = true;
}

function documentKeyUp(event) {
  let keyCode = event.keyCode;
  keyboard.keys[keyCode] = false;
}
