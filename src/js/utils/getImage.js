import getContext from "./getContext";

//returns a Float32Array buffer of 3D points after an image
export default function getImage(img, width, height, elevation) {
  const ctx = getContext(null, width, height);
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, width, height);
  const iData = imgData.data;

  const l = width * height;
  const data = new Float32Array(l * 3);

  for (let i = 0; i < l; i++) {
    const i3 = i * 3;
    const i4 = i * 4;
    data[i3] = (i % width) - width * 0.5;
    data[i3 + 1] =
      ((iData[i4] / 0xff) * 0.299 +
        (iData[i4 + 1] / 0xff) * 0.587 +
        (iData[i4 + 2] / 0xff) * 0.114) *
      elevation;
    data[i3 + 2] = parseInt(i / width) - height * 0.5;
  }

  return data;
}
