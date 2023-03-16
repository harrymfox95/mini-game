import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class RunnerModelLoader {
  constructor(modelType, modelPosition) {
    this.loader = new GLTFLoader();
    this.modelType = modelType;
    this.modelPosition = modelPosition;

    this.model = null;
    this.modelLoaded = false;
  }
  loadModel(scene, avatar) {
    if (this.modelType === "Jet") {
      this.loader.load(
        "models/Fighter.glb", // specify our file path
        (gltf) => {
          // using ES6 arrow syntax to ensure we can use our member variables (those starting with "this") inside the function
          // specify the callback function to call once the model has loaded
          this.onLoadStatic(gltf, this.modelPosition, avatar, scene);
        },
        this.onProgress, // specify progress callback
        this.onError // specify error callback
      );

      return this.model;
    }
  }

  onLoadStatic(gltf, position, avatar, scene) {
    this.model = gltf.scene.children[0]; // assign the first child of the scene contained in the gltf file to a variable called robot
    this.model.scale.multiplyScalar(5);
    this.model.castShadow = true;
    this.model.receiveShadow = true;
    this.model.flatShading = true;
    this.model.material.color.setHex(0x3a3a3a);
    this.model.position.copy(position); //copy the position passed from the load function call
    this.modelLoaded = true; // once our model has loaded, set our modelLoaded boolean flag to true
    avatar.setModel(this.model, scene);
    scene.add(this.model); // add our model to the scene
  }

  // the loader will report the loading progress to this function
  onProgress() {
    console.log("progress");
  }

  // the loader will send any error messages to this function, and we'll log
  // them to to console
  onError(errorMessage) {
    console.log(errorMessage);
  }
}
