import { createDisplayEngine, Pixel, text } from "@bigdots-io/display-engine";
import { GpioMapping, LedMatrix } from "rpi-led-matrix";
import express from "express";
import bodyParser from "body-parser";
import { Command } from "commander";

const program = new Command();

program
  .name("bigdots")
  .description("Power a hardware LED board")
  .version("0.1.0");

program
  .option("--rows <number>")
  .option("--cols <number>")
  .option("--brightness <number>")
  .option("--chain-length <number>");

program.parse(process.argv);

const options = program.opts();

console.log({ options });

const app = express();
const port = 3000;
app.use(bodyParser.json());

const matrix = new LedMatrix(
  {
    ...LedMatrix.defaultMatrixOptions(),
    rows: options.rows,
    cols: options.cols,
    chainLength: options.chainLength,
    hardwareMapping: GpioMapping.Regular,
  },
  {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 1,
  }
);

// let updateQueue: Pixel[][] = [];

// const engine = createDisplayEngine({
//   dimensions: {
//     width: options.cols * options.chainLength,
//     height: options.rows,
//   },
//   onPixelsChange: (pixels) => {
//     updateQueue.push(pixels);
//   },
// });

// function RGBAToHexA(rgba: Uint8ClampedArray, forceRemoveAlpha = false) {
//   const hexValues = [...rgba]
//     .filter((number, index) => !forceRemoveAlpha || index !== 3)
//     .map((number, index) => (index === 3 ? Math.round(number * 255) : number))
//     .map((number) => number.toString(16));

//   return (
//     "#" +
//     hexValues
//       .map((string) => (string.length === 1 ? "0" + string : string)) // Adds 0 when length of one number is 1
//       .join("")
//   );
// }

// matrix.afterSync((mat, dt, t) => {
//   if (updateQueue.length > 0) {
//     console.log("Queue:", updateQueue.length);
//   }

//   const pixelUpdates = updateQueue.shift();

//   if (pixelUpdates) {
//     for (const pixel of pixelUpdates) {
//       matrix
//         .brightness(options.brightness)
//         .fgColor(
//           parseInt(pixel.rgba ? RGBAToHexA(pixel.rgba, true) : "000000", 16)
//         )
//         .setPixel(pixel.x, pixel.y);
//     }
//   }

//   setTimeout(() => matrix.sync(), 0);
// });

// matrix.sync();

// engine.render([
//   text({
//     text: "Ready!",
//     color: "#FFFFFF",
//   }),
// ]);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.post("/macros", (req, res) => {
//   engine.render(req.body.macros);
//   res.status(204).send("received");
// });

// app.listen(port, () => {
//   console.log(`BigDots listening on port ${port}`);
// });
