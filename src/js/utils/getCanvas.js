const DEFAULT_WIDTH = 512;
const DEFAULT_HEIGHT = 512;

export default function getCanvas(w, h) {
  const canvas = document.createElement("canvas");

  canvas.width = w || DEFAULT_WIDTH;
  canvas.height = h || DEFAULT_HEIGHT;

  return canvas;
}
