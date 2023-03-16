import * as Tone from "tone";
let effect, reverb;

function createEffects() {
  effect = new Tone.FeedbackDelay().toDestination(); // create a delay effect and connect it to the master output
  reverb = new Tone.Reverb({
    // connect a reverb effect and connect it to the master output
    decay: 4, // decay time of 2 seconds.
    wet: 0.0, // fully wet signal
    preDelay: 0.25 // pre-delay time of 0.25 seconds
  });
}

createEffects();

export class CrashSound {
  constructor() {
    this.synth = new Tone.PolySynth({}).toDestination();
    this.synth.connect(effect);
    this.synth.connect(reverb);
    this.synth.set({
      volume: -10,
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0.01,
        release: 0.0
      }
    });
    this.synth.set({
      oscillator: {
        type: "square"
      }
    });

    this.pattern = new Tone.Pattern(
      function (time, note) {
        this.synth.triggerAttackRelease(note, "16n"); // Trigger the attack and release phases of the synth's envelope with the corresponding note from the note array. The release phase will be triggered at 16th note (semiquaver) after the envelope is triggered https://github.com/Tonejs/Tone.js/wiki/Time
      }.bind(this), // we bind this callback function to the current execution context so that "this" relates to our object instance, not the anonymous callback function's "this"
      ["C2", "C3", "D2", "D3", "E3", "E3", "C4", "D4", "E4", "F4", "G4"], // our array of notes
      "down" // the order in which to cycle through the array of notes
    );
    //https://tonejs.github.io/docs/r12/CtrlPattern

    this.pattern.loop = false; // don't loop the pattern
    this.pattern.interval = "32n"; // set the pattern's interval to be 32nd note (semidemiquaver)
  }

  reset() {}

  play() {
    this.pattern.start().stop("+0.2");
  }
}

export class CollectSound {
  // our crash sound class
  constructor() {
    this.synth = new Tone.PolySynth({}).toDestination();
    this.synth.connect(effect); // connecting synth to delay unit
    this.synth.connect(reverb); // connecting synth to reverb
    this.synth.set({
      volume: -10, // turning volume down a bit in dB
      envelope: {
        // set envelope to be percussive
        attack: 0.001,
        decay: 0.3,
        sustain: 0.01,
        release: 1.3
      }
    });
    this.synth.set({
      oscillator: {
        type: "square" // set oscillator wave
      }
    });

    this.pattern = new Tone.Pattern( // creating a pattern that will be triggered each time an event occurs - it's basically an arpeggiator  https://www.attackmagazine.com/technique/tutorials/an-introduction-to-arpeggiators/
      function (time, note) {
        // callback function which will be executed, passing the time note data in from when the function is called and the note array respectively
        this.synth.triggerAttackRelease(note, "16n"); // Trigger the attack and release phases of the synth's envelope with the corresponding note from the note array. The release phase will be triggered at 16th note (semiquaver) after the envelope is triggered https://github.com/Tonejs/Tone.js/wiki/Time
      }.bind(this), // we bind this callback function to the current execution context so that "this" relates to our object instance, not the anonymous callback function's "this"
      ["C4", "C5", "D4", "D5", "E5", "E5", "C6", "D6", "E6", "F6", "G6"], // our array of notes
      "up" // the order in which to cycle through the array of notes
    );
    //https://tonejs.github.io/docs/r12/CtrlPattern

    this.pattern.loop = false; // don't loop the pattern
    this.pattern.interval = "32n"; // set the pattern's interval to be 32nd note (semidemiquaver)
  }

  reset() {}

  play() {
    this.pattern.index = 0; // reset the index
    this.pattern.stop(); // stop pattern if it's already playing
    if (this.pattern.state !== "started") {
      // check whether the pattern has already started, and if not, start it.
      this.pattern.start().stop("+0.2"); // start the pattern then stop it 0.2 seconds later
    }
  }
}

export class BackingTrack {
  constructor() {
    Tone.start();
    this.player = new Tone.Player("./sounds/Music.mp3", () => {
      this.player.loop = true;
      this.player.autostart = true;
    }).toDestination(); // connect our audio to output
  }
}

export class CollectSounds {
  constructor() {
    Tone.start();
    this.soundFX = [];
    // this.numSoundFX = 5;
    // for (let i = 0; i < this.numSoundFX; i++)
    // {

    this.soundFX.push(
      (this.player0 = new Tone.Player("./sounds/303.mp3", () => {
        this.player0.loop = false;
        this.player0.autostart = false;
      }).toDestination())
    ); // connect our audio to output

    this.soundFX.push(
      (this.player1 = new Tone.Player("./sounds/909.mp3", () => {
        this.player1.loop = false;
        this.player1.autostart = false;
      }).toDestination())
    ); // connect our audio to output

    this.soundFX.push(
      (this.player2 = new Tone.Player("./sounds/Breakbeats.mp3", () => {
        this.player2.loop = false;
        this.player2.autostart = false;
      }).toDestination())
    ); // connect our audio to output

    this.soundFX.push(
      (this.player3 = new Tone.Player("./sounds/Dubstep Bass.mp3", () => {
        this.player3.loop = false;
        this.player3.autostart = false;
      }).toDestination())
    ); // connect our audio to output

    this.soundFX.push(
      (this.player4 = new Tone.Player("./sounds/FM.mp3", () => {
        this.player4.loop = false;
        this.player4.autostart = false;
      }).toDestination())
    ); // connect our audio to output
  }
  //}

  chooseSound() {
    this.randomItem = this.soundFX[
      Math.floor(Math.random() * this.soundFX.length)
    ];
    this.randomItem = new Tone.Player("./sounds/FM.mp3", () => {
      this.randomItem.loop = false;
      this.randomItem.autostart = false;
    }).toDestination();
  }
}
