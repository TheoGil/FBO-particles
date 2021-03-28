import getCanvas from "./getCanvas";

export default function getContext(canvas, w, h) {
  canvas = canvas || getCanvas(w, h);
  canvas.width = w || canvas.width;
  canvas.height = h || canvas.height;

  return canvas.getContext("2d");
}
