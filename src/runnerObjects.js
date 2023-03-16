import * as THREE from "three";
import { ToneAudioWorklet } from "tone/build/esm/core/worklet/ToneAudioWorklet.js";
import { CrashSound, CollectSound, CollectSounds } from "./sounds.js";

export class Environment {
  constructor(scene) {
    this.collidable = false; // set the collidable propery to false as we don't care whether we're colliding with the ground plane
    this.geomSizeX = 1000; // initialise width of plane
    this.geomSizeY = 5000; // initialise height of plane
    this.geometry = new THREE.PlaneGeometry( // create plane geometry and specify segments
      this.geomSizeX,
      this.geomSizeY,
      9,
      100
    );

    //Task 1 part 2
    for (let i = 0; i < this.geometry.vertices.length; i++) {
      //iterate through plane vertices and slightly randomise x and y positions to create some variation in the plane
      let vertex = this.geometry.vertices[i];
      vertex.x += Math.random() * 30 - 15;
      vertex.y += Math.random() * 30 - 15;
    }

    for (let i = 0, l = this.geometry.faces.length; i < l; i++) {
      //iterate through faces of plane geometry and randomise the colour to be variations of green
      let face = this.geometry.faces[i];
      face.vertexColors[0] = new THREE.Color().setHSL(
        //Hue Saturation and Value (HSL) are easier to use for randomisation within a certain colour
        0.15, //green
        THREE.MathUtils.randFloat(0.5, 0.8), // randomise saturation between 0.5 & 0.8
        THREE.MathUtils.randFloat(0.5, 0.8) // randomise value between 0.5 & 0.8
      );
      face.vertexColors[1] = new THREE.Color().setHSL(
        //Hue Saturation and Value (HSL) are easier to use for randomisation within a certain colour
        0.1, //green
        THREE.MathUtils.randFloat(0.5, 0.8), // randomise saturation between 0.5 & 0.8
        THREE.MathUtils.randFloat(0.5, 0.8) // randomise value between 0.5 & 0.8
      );
      face.vertexColors[2] = new THREE.Color().setHSL(
        //Hue Saturation and Value (HSL) are easier to use for randomisation within a certain colour
        0.05, //green
        THREE.MathUtils.randFloat(0.5, 0.8), // randomise saturation between 0.5 & 0.8
        THREE.MathUtils.randFloat(0.5, 0.8) // randomise value between 0.5 & 0.8
      );
    }

    this.material = new THREE.MeshPhongMaterial({
      //create our new plane material
      //Task 1 part 3, update below to comment out/delete the color attribute and add in the vertex colours line of code code
      //color: 0x65dd65
      vertexColors: THREE.VertexColors // ansure vertex colours is set so that we can use randomisation
    });
    //next we create two meshes using the same geometry and material. We're going to keep moving them with the camera to give the impression that we're moving on a continuous ground plane
    this.mesh1 = new THREE.Mesh(this.geometry, this.material); //create first mesh

    this.mesh1.position.x = this.mesh1.position.y = this.mesh1.position.z = 0; // initialise x y and z positions
    this.mesh1.receiveShadow = true; // ensure we're going receive a shadow from any light/objects cast
    this.mesh1.rotation.set(Math.PI * -0.5, 0, 0); //rotate our plane 90 degrees around the x axis so it becomes the floor

    this.mesh2 = new THREE.Mesh(this.geometry, this.material); // create second mesh

    this.mesh2.position.x = this.mesh2.position.y = 0; // this time only set x and y pos
    this.mesh2.position.z = -(this.geomSizeY - 5); // we're going to move this plane up to the end of the first one, with a tiny bit of overlap
    this.mesh2.receiveShadow = true; // ensure we're going receive a shadow from any light/objects cast

    this.mesh2.rotation.set(Math.PI * -0.5, 0, 0); //rotate our plane 90 degrees around the x axis so it becomes the floor

    this.groundGroup = new THREE.Group(); // create a new group
    this.groundGroup.add(this.mesh1); //add first mesh to the group
    this.groundGroup.add(this.mesh2); //add second mesh to the group

    scene.add(this.groundGroup); // add group to the scene
  }

  reset() {}

  update(camera) {
    // move groundMesh
    if (this.mesh1.position.z - this.geomSizeY > camera.position.z) {
      // once the camera goes past the start of the mesh postion
      this.mesh1.position.z -= this.geomSizeY * 2; // move the mesh back into the distance by twice it's length
      //console.log("moveMesh1", this.mesh1.position.z);
    }
    if (this.mesh2.position.z - this.geomSizeY > camera.position.z) {
      // once the camera goes past the start of the mesh postion
      this.mesh2.position.z -= this.geomSizeY * 2; // move the mesh back into the distance by twice it's length
      //console.log("moveMesh2", this.mesh2.position.z);
    }
  }
}

export class Avatar {
  constructor(scene) {
    this.collidable = true; // initialise collidable to be true because we want to test whether the avatar collides with other objects in the scene
    this.size = 5.0; // initialise a size variable to use in collision detection
    this.radius = 5.0; // radius of our avatar's geometry
    this.heroModel = false; // to be used if were were to load a model instead of using a THREE js primitive
    this.hero = new THREE.Mesh(); // create our avatar's mesh
    this.synth = new CrashSound(); // create our sound effect to be triggered on collision
    this.collectSounds = new CollectSounds();
  }

  setModel(model, scene) {
    // to be used in event of loading a model to replace the THREE primitive
    this.hero = model;
    scene.add(this.hero);
    this.heroModel = true;
  }

  reset() {}

  update(speed, obstacles, spheres, keyboard) {
    //task 3 part 3 in here
    this.hero.rotation.y = Math.PI;
    //task 6 part 1 in here
    if (this.collidedWithObstacle(obstacles)) {
      // have we collided with an obsctacle?
      console.log("------ CRASH ------"); // print to console
      this.synth.play(); // trigger our crash sound
      this.score = this.score - 10;
      this.updatedSpeed = this.score;
      console.log("Score = ", this.score);
      //window.alert(this.score);
      document.getElementById("score").innerHTML = this.score;
    }

    if (this.collectedSphere(spheres)) {
      // have we collided with an obsctacle?
      console.log("------ Good Job! ------"); // print to console
      collectSounds.chooseSound();
      this.score = this.score + 10;
      this.updatedSpeed = this.score;
      console.log("Score = ", this.score);
      //window.alert(this.score);
      document.getElementById("score").innerHTML = this.score;
    }

    //task 3 part 5 in here

    if (keyboard.isKeydown(38) === true) {
      // keyboard movement up and down
      this.hero.position.y += 0.25;
    }

    if (keyboard.isKeydown(40) === true) {
      if (this.hero.position.y < this.radius) {
        this.hero.position.y = this.radius;
      } else {
        this.hero.position.y -= 0.25;
      }
    }

    if (keyboard.isKeydown(37) === true) {
      // is the left arrow key pressed?
      this.hero.position.x -= 0.5; // move our "hero" mesh to the left
    }

    if (keyboard.isKeydown(39) === true) {
      // is the right arrow key pressed?
      this.hero.position.x += 0.5; // move our "hero" mesh to the right
    }

    if (keyboard.isKeydown(68) === true) {
      // keyboard movement up and down
      this.hero.rotation.z += 0.05;
    }

    if (keyboard.isKeydown(65) === true) {
      // keyboard movement up and down
      this.hero.rotation.z -= 0.05;
    }

    this.hero.position.z -= speed; // always keep moving forward by subtracting global speed to the current z position
  }

  distanceTo(x, z) {
    // use basic pythagoras to calculate the distance between two objects
    // (xA-xB)²+(yA-yB)²+(zA-zB)² < (rA+rB)²

    let dist = Math.abs(
      Math.sqrt(
        (this.hero.position.x - x) * (this.hero.position.x - x) +
          (this.hero.position.z - z) * (this.hero.position.z - z)
      )
    );
    //  console.log("DistanceTo() = " + dist);
    return dist;
  }

  isCollidedWith(that) {
    // test whether one object is within the range of another one to constitute a collision
    // size + size > distance
    let collidedWith =
      this.size + that.size >
      this.distanceTo(that.obstacle.position.x, that.obstacle.position.z); // is the object within range of the other object using the avatar's size and obstacle's size (because the we need to factor in that there are two objects with their own sizes to be tested)

    return collidedWith; // this will return false if we are not in range and true if we are in range
  }

  isCollected(that) {
    // test whether one object is within the range of another one to constitute a collision
    // size + size > distance
    let collected =
      this.size + that.size >
      this.distanceTo(that.sphere.position.x, that.sphere.position.z);

    return collected; // this will return false if we are not in range and true if we are in range
  }

  collidedWithObstacle(obstacles) {
    //Task 6 part 2 in here
    for (let n = 0; n < obstacles.length; n++) {
      // iterate through entire obstacles array
      if (obstacles[n].collidable === true) {
        // make sure that we actually care whether we collide with the object or not
        if (this.isCollidedWith(obstacles[n]) === true) {
          // have we collided?
          obstacles[n].material.color.setHex(0xff0000); // change colour of that obstacle to red
          obstacles[n].collidable = false;
          return true; // return true to our main update function s we can trigger our sound etc.
        }
      }
    }
    return false; // we didn't collide with anything so return false to our update function
  }

  collectedSphere(spheres) {
    //Task 6 part 2 in here
    for (let n = 0; n < spheres.length; n++) {
      // iterate through entire obstacles array
      if (spheres[n].collidable === true) {
        // make sure that we actually care whether we collide with the object or not
        if (this.isCollected(spheres[n]) === true) {
          // have we collided?
          spheres[n].material.color.setHex(0x00ff00); // change colour of that obstacle to green
          spheres[n].collidable = false;
          return true; // return true to our main update function s we can trigger our sound etc.
        }
      }
    }
    return false; // we didn't collide with anything so return false to our update function
  }
}

export class TreeObstacle {
  constructor(x, y, z, scene) {
    this.collidable = true; // initialise collidable to be true because we want to test whether the avatar collides with other objects in the scene
    this.size = 5.0; // initialise a size variable to use in collision detection
    this.geometry = new THREE.ConeGeometry(Math.random(1, 3), 2, 7, 21); // using a cone as a basis for creating very simple trees
    this.material = new THREE.MeshLambertMaterial({
      color: 0xd89400 //
    });

    this.obstacle = new THREE.Mesh(this.geometry, this.material);
    this.obstacle.castShadow = true; // make sure our meshes cast a shadow
    this.obstacle.receiveShadow = true; // make sure our meshes receive a shadow

    scene.add(this.obstacle); // add the group to the scene

    this.obstacle.position.x = x; // set our group's x position
    this.obstacle.position.y = y; // set our group's y position
    this.obstacle.position.z = z; // set our group's z position
    this.obstacle.scale.set(20, 20, 20); // scale the entire group up quite a bit to make them more of an obstacle
  }

  reset() {
    // call reset when the tree is off camera (in index.js)
    this.obstacle.position.z -= THREE.MathUtils.randInt(1000, 3000); //move the tree to a new random position somewhere in the distance
    this.material.color.setHex(0xd89400); // reset colour to green
    this.collidable = true;
  }

  update() {}
}

export class SphereObstacle {
  constructor(x, y, z, scene) {
    this.collidable = true; // initialise collidable to be true because we want to test whether the avatar collides with other objects in the scene
    this.size = 5.0; // initialise a size variable to use in collision detection
    this.sphereModel = false;
    this.geometry = new THREE.SphereGeometry(0.5, 2, 7, 21); // using a cone as a basis for creating very simple trees
    this.material = new THREE.MeshLambertMaterial({
      color: 0xff00ff //
    });

    this.sphere = new THREE.Mesh(this.geometry, this.material);

    this.sphere.castShadow = true; // make sure our meshes cast a shadow
    this.sphere.receiveShadow = true; // make sure our meshes receive a shadow

    scene.add(this.sphere); // add the group to the scene

    this.sphere.position.x = x; // set our group's x position
    this.sphere.position.y = y; // set our group's y position
    this.sphere.position.z = z; // set our group's z position
    this.sphere.scale.set(20, 20, 20); // scale the entire group up quite a bit to make them more of an obstacle
  }

  reset() {
    // call reset when the tree is off camera (in index.js)
    this.sphere.position.z -= THREE.MathUtils.randInt(1000, 3000); //move the sphere to a new random position somewhere in the distance
    this.material.color.setHex(0xff00ff); // reset colour to Pink
    this.collidable = true;
  }

  update() {}
}
