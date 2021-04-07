const imageLoader = document.getElementById("imageUpload");

//to make all of it async add a promise
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"), //face recoginzer
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"), //find faces
  faceapi.nets.ssdMobilenetv1.loadFromUri("./models"), //detection for faces
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(start);

let faceSizes = [];
let expression;
function start() {
  const container = document.createElement("div");
  container.style.position = "relative";
  document.body.append(container);
  document.body.append("Loaded");
  imageLoader.addEventListener("change", async () => {
    const image = await faceapi.bufferToImage(imageLoader.files[0]); //convert file to image element usable with face api library
    container.append(image);
    const canvas = faceapi.createCanvasFromMedia(image);
    canvas.style.height = "20";
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks();
    const detectionswithFace = await faceapi
      .detectAllFaces(image)
      .withFaceExpressions();
    let maxVal = 0;
    for(i=0;i<detections.length;i++){
        for (let prop in detectionswithFace[i].expressions) {
            if (detectionswithFace[i].expressions) {
              let value = detectionswithFace[i].expressions[prop];
              if (value > maxVal) {
                maxVal = value;
                expression = prop;
              }
            }
          }
        console.log("This person seems to be " + expression);
    }
    const resizeDetections = faceapi.resizeResults(detections, displaySize);
    resizeDetections.forEach((detection) => {
      const box = detection.detection.box;
      faceSizes.push([box.height, box.width]); //get height and width of the box
      const drawBox = new faceapi.draw.DrawBox(box);
      drawBox.draw(canvas);
    });
    console.log(faceSizes)
    console.log(image.height);
    console.log(image.width);
  });
}
