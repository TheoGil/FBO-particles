/**
 * We'll create a canvas the size of the image.
 * Draw the image onto the canvas and then read its ImageData.
 * We'll iterate over the ImageData object and for every pixel, compute XYZ values based on the index and greyscale
 * of the pixel. Those values will be returned as a Float32Array.
 *
 * @param {Image} img
 * @param {integer} width
 * @param {integer} height
 * @param {float} elevation
 * @returns Float32Array
 */
export default function getImage(img, width, height, elevation) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, width, height).data;

  const l = width * height;
  const data = new Float32Array(l * 3);

  for (let i = 0; i < l; i++) {
    const i3 = i * 3;
    const i4 = i * 4;

    const normX = (i % width) - width * 0.5;

    // Use the grey value of every pixel to compute the y position, base on the elevation parameter
    const normR = imgData[i4 + 0] / 255;
    const normG = imgData[i4 + 1] / 255;
    const normB = imgData[i4 + 2] / 255;
    const greyscale = normR + normG + normB;
    const normY = greyscale * elevation;

    const normZ = parseInt(i / width) - height * 0.5;

    data[i3 + 0] = normX;
    data[i3 + 1] = normY;
    data[i3 + 2] = normZ;
  }

  return data;
}
