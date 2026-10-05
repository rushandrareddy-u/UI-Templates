# AI Mirror — See What the Model Sees

A polished, dependency-light browser demo for explaining computer-vision predictions visually.

## Features

- Futuristic glassmorphism / neon AI interface
- 3D perspective mirror viewer with mouse tilt
- Animated neural scanning beam
- Animated attention/focus ring
- Real object-detection bounding boxes
- Prediction + confidence visualization
- Attention strength, visual similarity and region-focus indicators
- Drag-and-drop image upload
- Annotated PNG export
- Responsive desktop/tablet/mobile layout
- Client-side inference: uploaded images are not sent to a server by this app

## Technology

The UI is plain:

- `index.html`
- `style.css`
- `script.js`

For genuine browser inference, `script.js` loads:

- TensorFlow.js
- COCO-SSD

These are loaded from jsDelivr in `index.html`, so no build system or framework is required.

### Model note

COCO-SSD is a real object-detection model trained on the COCO dataset. It predicts common object categories and bounding boxes. The UI's **confidence** comes directly from the model prediction score.

The three explanatory indicators are intentionally presented as visualization heuristics rather than claiming access to the model's internal attention maps:

- **Attention strength** combines the primary detection confidence and the number of detected regions.
- **Visual similarity** summarizes detection confidence across returned regions.
- **Region focus** estimates how prominent the primary detected region is in the image.

This distinction matters: COCO-SSD does not expose a native human-readable attention map through this simple browser API.

## Run locally

Because the page loads JavaScript model assets, use a local web server instead of opening `index.html` with `file://`.

### Option 1 — Python

```bash
cd AI-Mirror-Model-Explainer
python3 -m http.server 8000
```

Then open:

`http://localhost:8000`

### Option 2 — VS Code

Use any simple local-server extension and open `index.html` through the server.

## Hackathon demo flow

1. Launch the page.
2. Wait for **Vision model ready**.
3. Drag in a photo containing recognizable objects.
4. Watch the scanning animation.
5. Inspect bounding boxes, labels and confidence.
6. Move the mouse over the mirror to demonstrate the 3D perspective.
7. Download the annotated PNG.

## Privacy

The application does not include an upload API or backend. The selected image is read by the browser and passed directly to the in-browser detector.

The external TensorFlow.js and COCO-SSD libraries are downloaded from jsDelivr when the page loads. If your hackathon environment requires fully offline operation, download/self-host those library files and change the two `<script>` tags in `index.html`.

## Customization

The easiest areas to customize are:

- Visual theme: CSS variables at the top of `style.css`
- Detection threshold: `model.detect(sourceImage, 20, 0.35)`
- Maximum detections: `20`
- Export styling: `downloadBtn` handler in `script.js`
- Model: replace COCO-SSD with another browser-compatible detector if required

## Limitations

- COCO-SSD recognizes a fixed set of common COCO object categories; it is not a general image classifier.
- Browser performance depends on the device.
- Confidence is model output, not a probability guarantee.
- The explanatory metrics are visualization heuristics, not native model attention values.

## License / attribution

Check the licenses and attribution requirements of TensorFlow.js, COCO-SSD, and their transitive assets before distributing the project commercially.
