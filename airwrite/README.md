# AIRWRITE — Write Without Touching

Designed & built for **U. RUSHANDRA REDDY**.

## Run

```bash
python -m http.server 8000
```

Open **http://localhost:8000** in Safari or Chrome and click **Enable Camera**. Allow camera access.

## What works

- Real webcam access with explicit camera button
- MediaPipe hand tracking
- Index-finger air drawing
- Open palm / fist / thumb-up / two-finger gestures
- Neon, Laser, Ink and Galaxy trails
- Undo / redo / clear
- Mirror and fullscreen
- Browser-side OCR using Tesseract.js
- Recognition button for clear block-style letters, words, names and common symbols
- Automatic recognition attempt after writing pauses
- Copy, TXT and PNG export
- Text-to-speech
- Magic Demo Mode

## For better recognition

Write **large, clear, separated block letters** inside the writing zone. Example:

`HELLO`

`RUSHANDRA`

`123 + 45 = 168`

`? ! + - = % @ # &`

The OCR is entirely browser-side; it does not require an API key. It is best for clear air-written block characters. Cursive or very fast handwriting may need a dedicated trajectory-trained handwriting model for higher accuracy.
