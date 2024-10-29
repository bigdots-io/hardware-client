import {
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

  if (hour >= 6 && hour <= 18) {
    engine.render([
      // image({
      //   url: "data:image/png;base64,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",
      // }),
      text({
        text: "♥︎",
        color: "#CC5500",
        fontSize: 20,
      }),
    ]);
  } else {
    engine.render([
      text({
        text: "🛏️",
        color: "#FFFFFF",
      }),
    ]);
  }
}

setInterval(loop, ONE_MINUTE);

loop();
