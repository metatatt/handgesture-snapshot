import { HandGesture } from './lib/HandGesture.js';
import { VoiceCommand } from './lib/VoiceCommand.js';
import { ChatBot } from './lib/ChatBot.js';

import {
  HandLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

var HandCheckrApp = new Vue({
  el: '#handCheckr',
  data: {
    datasetId: 'demo',
    promptText: '',
    gridId: "",
    userId: null,
  },

  mounted() {
    this.videoElement = document.getElementById("video");
    this.canvasElement = document.getElementById("canvas");
    this.ctx = this.canvasElement.getContext("2d", { willReadFrequently: true });
    this.main();
  },

  methods: {

    async main() {
      this.loadComponents();
      this.loadFlowHandlers();
      this.loadHandMarker();
      this.handGesture.start();
      this.voiceCommand.start();
    },

    async startMainLoop() {

      this.ctx.save();
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      this.snapShotBoxLoc = '';

        let startTimeMs = performance.now();
        const results = await this.handLandmarker.detectForVideo(this.videoElement, startTimeMs);

        if (results.landmarks) {
          for (const landmarks of results.landmarks) {
            this.handGesture.drawHand(landmarks, HAND_CONNECTIONS);
            this.handGesture.detectGesture(landmarks);
          }
        }

      this.ctx.restore();
      window.requestAnimationFrame((timestamp) => this.startMainLoop(timestamp));
    },

    loadComponents() {
      this.handGesture = new HandGesture(this.canvasElement, this.videoElement);
      this.voiceCommand = new VoiceCommand();
      this.chatBot = new ChatBot();
    },

    async loadFlowHandlers() {

      window.addEventListener('DOMContentLoaded', () => {
        this.promptText = 'say "hey Joe"...'
        this.startMainLoop();
      });

      window.addEventListener('voiceCommandHey', () => {
        this.promptText = 'two-finger "snip" at object...'
        this.startMainLoop();
      });

      window.addEventListener('twoFingerGesture', () => {
        this.promptText = 'say "check"...'
        this.takeSnapShot();
      });

      window.addEventListener('voiceCommandCheck', () => {
        this.promptText = 'now checking...'
        this.checkSnapShot();
      });

      window.addEventListener('cvResultReady', () => {
        console.log('cvResult**4 eventListener')
        this.promptText = 'cv prediction results ready...'
        this.startMainLoop();
        this.feedInput()
      });

      window.addEventListener('receivedGPTResponse', () => {
        this.promptText = 'two-finger "snip" at object...'
        this.startMainLoop();
      });

    },


    async takeSnapShot() {
      this.snapShotBoxLoc = await this.handGesture.snapShotLoc(
        this.canvasElement.width,
        this.canvasElement.height
      );
      this.handGesture.drawSnapShotBox(this.snapShotBoxLoc);
    },

    async loadHandMarker() {
      const runningMode = "VIDEO";
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: runningMode,
          numHands: 2
        });

      } catch (error) {
        console.error('Error loading handLandmarker:', error);
      }
    },

    async checkSnapShot() {
      const snippingGesture = this.handGesture._isSnipping
      if (!snippingGesture) {
        return
      }
      
      const imageBlob = await this.handGesture.makeSnapShot(this.snapShotBoxLoc);
      this.chatBot.addImage(imageBlob);
    },

    
    async feedInput(){
    },

  },
});
