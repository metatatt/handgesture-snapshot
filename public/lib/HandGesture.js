

  export class HandGesture {
    constructor(canvasElement, videoElement) {
      this.videoElement = videoElement;
      this.canvasElement = canvasElement;
      this.ctx = canvasElement.getContext("2d", { willReadFrequently: true });
      this.angleDeg = 8;  // Threshold angle degree spray for act of "two-finger gesture"
      this._isSnipping = false;
      this.latestActiveTime =0;
      this.markerList=[];
    }

    async start(){
      const constraints = {
        video: {
          facingMode: "environment",
          width: 1024,
          height: 768
        }
      };
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.videoElement.srcObject = stream;
        this.videoElement.setAttribute("playsinline", true);
        this.videoElement.play();

      } catch (error) {
        console.log("#setUpVideo -Unable to access video stream:", error);
      }
    }

detectGesture(landmarks) {
      const p5 = landmarks[5];
      const p8 = landmarks[8];
      const p9 = landmarks[9];
      const p12 = landmarks[12];
      const p4 = landmarks[4];
      const p16 = landmarks[16];
    
      // Calculate vectors A and B
      const vectorA = { x: p8.x - p5.x, y: p8.y - p5.y }; // index finger
      const vectorB = { x: p12.x - p9.x, y: p12.y - p9.y }; // middle finger
    
      // Calculate the angle spray between vectors A and B
      const dotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
      const magnitudeA = Math.sqrt(vectorA.x * vectorA.x + vectorA.y * vectorA.y);
      const magnitudeB = Math.sqrt(vectorB.x * vectorB.x + vectorB.y * vectorB.y);
      const cosAngle = dotProduct / (magnitudeA * magnitudeB);
      const angleRad = Math.acos(cosAngle);
      const angleDeg = (angleRad * 180) / Math.PI;
    
      // Calculate the orientation per p5 - p8
      const deltaX = p5.x - p8.x;
      const deltaY = p5.y - p8.y;
      const orienRotate = Math.atan2(deltaY, deltaX); // usage newCtx.rotate(orienRotate)
    
      // Calculate the distance between p4-p8 and p4-p16
      const dist48 = Math.sqrt((p4.x - p8.x) ** 2 + (p4.y - p8.y) ** 2);
      const dist416 = Math.sqrt((p4.x - p16.x) ** 2 + (p4.y - p16.y) ** 2);
    
      const ifDeg = angleDeg <= this.angleDeg; // assuming you have 'this.angleDeg' defined elsewhere
      const ifHoldPalm = dist416 < dist48;
    
      const marker = {
        detected: ifDeg && ifHoldPalm,
        p5: p5,
        p8: p8,
        orienRotate: orienRotate,
      };
      this.markerList.push(marker)
      let twoFingerDetected = false;
      if (this.markerList.length > 4) {
        this.markerList.shift(); // Remove the first element to keep the array size to 4
        twoFingerDetected = this.markerList.every(marker => marker.detected);
      }
      if (twoFingerDetected){
        this._isSnipping = true;
        const event = new Event('twoFingerGesture');
        window.dispatchEvent(event);
      }else{
        this._isSnipping = false;
      }
    }
    

snapShotLoc(canvasWidth, canvasHeight) {
      const marker = this.markerList[this.markerList.length-1]
      const p5 = marker.p5;
      const p8 = marker.p8;
      p5.x = p5.x * canvasWidth;
      p8.x = p8.x * canvasWidth;
      p5.y = p5.y * canvasHeight;
      p8.y = p8.y * canvasHeight;
      const squareSideLength = 224;
    
      // Calculate the direction from p5 to p8
      const vectorDirection = { x: p8.x - p5.x, y: p8.y - p5.y };
      const magnitude = Math.sqrt(vectorDirection.x * vectorDirection.x + vectorDirection.y * vectorDirection.y);
      const normalizedDirection = { x: vectorDirection.x / magnitude, y: vectorDirection.y / magnitude };
    
      // Calculate the perpendicular vector to the normalized direction
      const perpendicularVector = { x: -normalizedDirection.y, y: normalizedDirection.x };
    
      // Calculate the midpoint of the bottom edge line
      const midBottom = {
        x: (p5.x + p8.x) /2+normalizedDirection.x*112,
        y: (p5.y + p8.y) /2+normalizedDirection.y*112
      };
    
      // Calculate the corner coordinates
      const cornerTL = {
        x: (midBottom.x - (perpendicularVector.x * (squareSideLength))/2),
        y: (midBottom.y - (perpendicularVector.y * squareSideLength) /2)
      };
      const cornerTR = {
        x: midBottom.x + (perpendicularVector.x * squareSideLength) /2,
        y: midBottom.y + (perpendicularVector.y * squareSideLength) /2
      };
      const cornerBL = {
        x: cornerTL.x + normalizedDirection.x * squareSideLength,
        y: cornerTL.y + normalizedDirection.y * squareSideLength
      };
      const cornerBR = {
        x: cornerTR.x + normalizedDirection.x * squareSideLength,
        y: cornerTR.y + normalizedDirection.y * squareSideLength
      };
    const boxLoc = {
      locTL: cornerTL,
      locTR: cornerTR,
      locBL: cornerBL,
      locBR: cornerBR,
    }
    return boxLoc
  }

makeSnapShot(boxLoc) {
   
    const { locTL, locTR, locBL, locBR } = boxLoc;

    // Calculate the width and height of the square
    const width = Math.sqrt((locTL.x - locTR.x) ** 2 + (locTL.y - locTR.y) ** 2);
    const height = width;

    // Calculate the center point of the square
    const centerX = (locTL.x + locTR.x + locBL.x + locBR.x) / 4;
    const centerY = (locTL.y + locTR.y + locBL.y + locBR.y) / 4;
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width
    newCanvas.height = width
    const newCtx =  newCanvas.getContext('2d');
    newCtx.clearRect(0, 0, width, width);
    const angle = -Math.atan2(-locTL.y + locTR.y, -locTL.x + locTR.x)

    // Rotate and draw the square
    newCtx.translate(width / 2, height / 2);
    newCtx.rotate(angle);
    newCtx.drawImage(this.videoElement, -centerX, -centerY);

    // Get the ImageData object from the canvas = image Unit8Data 
    newCtx.getImageData(0, 0, width, height);
    const imageBlobPromise = new Promise(resolve => {
      newCanvas.toBlob(blob => {
        resolve(blob);
      }, 'image/png'); // Change to 'image/jpeg' if needed
    });
    return imageBlobPromise;
    }

async checkType(imageBlob) {
      // Create an image element and load the imageBlob
      const resultImage = new Image();
      resultImage.src = URL.createObjectURL(imageBlob);
    
      // Wait for the image to load
      await new Promise(resolve => {
        resultImage.onload = resolve;
      });
    
      const width = resultImage.width;
      const height = resultImage.height;
    
      // Create a canvas and draw the loaded image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(resultImage, 0, 0, width, height);
    
      // Get the image data from the canvas
      const imageData = ctx.getImageData(0, 0, width, height);
    
      // Decode QR code using jsQR
      const qrCode = jsQR(imageData.data, width, height, {
        inversionAttempts: 'dontInvert',
      });
    
      let cardData = '';
    
      if (qrCode && qrCode.data.startsWith('@pr-')) {
        cardData = qrCode.data;
        console.log('cardData*** ', cardData)
        return cardData.slice(4, 9);
      }
    }

drawHand(landmarks, HAND_CONNECTIONS){
      drawConnectors(this.ctx, landmarks, HAND_CONNECTIONS, {
        color: "#FFFFFF",
        lineWidth: 1.5
        });
              
        drawLandmarks(this.ctx, landmarks, { 
        color: "#5065A8",
        lineWidth: 0.4 
        });
    }

drawSnapShotBox(boxLoc) {  
      // Draw the snapshot box using the provided corner locations
      this.ctx.strokeStyle = 'red'; // Set the stroke color to red (you can change it to any color you prefer)
      this.ctx.lineWidth = 2; // Set the line width as desired
    
      this.ctx.beginPath();
      this.ctx.moveTo(boxLoc.locTL.x, boxLoc.locTL.y); // Move to the top-left corner
      this.ctx.lineTo(boxLoc.locTR.x, boxLoc.locTR.y); // Draw to the top-right corner
      this.ctx.lineTo(boxLoc.locBR.x, boxLoc.locBR.y); // Draw to the bottom-right corner
      this.ctx.lineTo(boxLoc.locBL.x, boxLoc.locBL.y); // Draw to the bottom-left corner
      this.ctx.closePath(); // Close the path to connect the last and first points
      this.ctx.stroke(); // Stroke the path to draw the box
    }
  
  
    
}
