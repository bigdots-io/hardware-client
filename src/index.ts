import {
  box,
  coordinates,
  createDisplayEngine,
  image,
  Pixel,
  text,
} from "@bigdots-io/display-engine";
import {
  GpioMapping,
  LedMatrix,
  LedMatrixInstance,
  MatrixOptions,
} from "rpi-led-matrix";
import express from "express";
import bodyParser from "body-parser";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { Canvas } from "canvas";
import { moon } from "./moon.js";
import { rainbow } from "./rainbow.js";

const program = new Command();

program
  .name("bigdots")
  .description("Power a hardware LED board")
  .version("0.1.0");

program
  .option("--rows <number>")
  .option("--cols <number>")
  .option("--brightness <number>")
  .option("--chain-length <number>")
  .option("--debug <boolean>")
  .option("--emulate <boolean>");

program.parse(process.argv);

const options = program.opts();

const app = express();
const port = 3000;
app.use(bodyParser.json());

let matrix: LedMatrixInstance;
let canvas: Canvas;
let updateQueue: Pixel[][] = [];

if (!options.emulate) {
  matrix = new LedMatrix(
    {
      ...LedMatrix.defaultMatrixOptions(),
      rows: parseInt(options.rows, 10) as MatrixOptions["rows"],
      cols: parseInt(options.cols, 10) as MatrixOptions["cols"],
      chainLength: parseInt(
        options.chainLength,
        10
      ) as MatrixOptions["chainLength"],
      hardwareMapping: GpioMapping.Regular,
    },
    {
      ...LedMatrix.defaultRuntimeOptions(),
      gpioSlowdown: 2,
    }
  );

  matrix.afterSync((mat, dt, t) => {
    if (options.debug && updateQueue.length > 0) {
      console.log("Queue:", updateQueue.length);
    }

    const pixelUpdates = updateQueue.shift();

    if (pixelUpdates) {
      for (const pixel of pixelUpdates) {
        matrix
          .brightness(parseInt(options.brightness, 10))
          .fgColor(
            parseInt(pixel.rgba ? RGBAToHexA(pixel.rgba, true) : "000000", 16)
          )
          .setPixel(pixel.x, pixel.y);
      }
    }

    setTimeout(() => matrix.sync(), 0);
  });

  matrix.sync();
}

const engine = createDisplayEngine({
  dimensions: {
    width: parseInt(options.cols, 10) * options.chainLength,
    height: parseInt(options.rows, 10),
  },
  onPixelsChange: (pixels, index, engineCanvas) => {
    canvas = engineCanvas;
    updateQueue.push(pixels);
  },
});

function RGBAToHexA(rgba: Uint8ClampedArray, forceRemoveAlpha = false) {
  const hexValues = [...rgba]
    .filter((_number, index) => !forceRemoveAlpha || index !== 3)
    .map((number, index) => (index === 3 ? Math.round(number * 255) : number))
    .map((number) => number.toString(16));

  return hexValues
    .map((string) => (string.length === 1 ? "0" + string : string)) // Adds 0 when length of one number is 1
    .join("");
}

engine.render([
  text({
    text: "HI",
    color: "#FFFFFF",
  }),
]);

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "image/png");
  canvas.createPNGStream().pipe(res);
});

app.post("/macros", (req, res) => {
  engine.render(req.body.macros);
  res.status(204).send("received");
});

app.listen(port, () => {
  console.log(`BigDots listening on port ${port}`);
});

const ONE_MINUTE = 1 * 60 * 1000;

function loop() {
  const hour = new Date().getHours();

  console.log({ hour });

  if (hour >= 18 || hour <= 5) {
    engine.render([
      coordinates({
        coordinates: moon,
      }),
    ]);
  } else if (hour >= 6) {
  }
}

setInterval(loop, ONE_MINUTE);

engine.render([
  text({
    text: "hi!...",
  }),
]);

setTimeout(() => {
  loop();
}, 5000);
