import { coordinates, createDisplayEngine } from "@bigdots-io/display-engine";
import type { Pixel } from "@bigdots-io/display-engine";
import { LedMatrix, GpioMapping } from "rpi-led-matrix";
import fs from "fs";

function getSceneData(name: string) {
  const file = fs.readFileSync(`../scenes/${name}.json`).toString();
  return JSON.parse(file);
}

function getDatabase() {
  const file = fs.readFileSync(`./database.json`).toString();
  return JSON.parse(file);
}

function RGBAToHexA(rgba: Uint8ClampedArray, forceRemoveAlpha = false) {
  const hexValues = [...rgba]
    .filter((_number, index) => !forceRemoveAlpha || index !== 3)
    .map((number, index) => (index === 3 ? Math.round(number * 255) : number))
    .map((number) => number.toString(16));

  return hexValues
    .map((string) => (string.length === 1 ? "0" + string : string)) // Adds 0 when length of one number is 1
    .join("");
}

const updateQueue: Pixel[][] = [];

const matrix = new LedMatrix(
  {
    ...LedMatrix.defaultMatrixOptions(),
    rows: 32,
    cols: 32,
    chainLength: 1,
    hardwareMapping: GpioMapping.Regular,
  },
  {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 2,
  }
);
matrix.afterSync(() => {
  // if (options.debug && updateQueue.length > 0) {
  //   console.log("Queue:", updateQueue.length);
  // }
  const pixelUpdates = updateQueue.shift();
  if (pixelUpdates) {
    for (const pixel of pixelUpdates) {
      matrix
        .brightness(30)
        .fgColor(
          parseInt(pixel.rgba ? RGBAToHexA(pixel.rgba, true) : "000000", 16)
        )
        .setPixel(pixel.x, pixel.y);
    }
  }
  setTimeout(() => matrix.sync(), 0);
});
matrix.sync();

const engine = createDisplayEngine({
  dimensions: {
    width: 32,
    height: 32,
  },
  onPixelsChange: (pixels) => {
    updateQueue.push(pixels);
  },
});

export async function startPanelLoop() {
  setInterval(() => {
    const database = getDatabase();

    const slotToActivate = database.overrideSlot || database.scheduledSlot;

    console.log(getSceneData(slotToActivate.scene)["13:5"]);

    engine?.render([
      coordinates({
        coordinates: getSceneData(slotToActivate.scene),
      }),
    ]);
  }, 1000);
}
