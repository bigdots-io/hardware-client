import type { Pixel } from "@bigdots-io/display-engine";
import type { LedMatrixInstance, MatrixOptions } from "rpi-led-matrix";
import {
  coordinates,
  createDisplayEngine,
  scene,
  text,
} from "@bigdots-io/display-engine";
import { LedMatrix, GpioMapping } from "rpi-led-matrix";
import express from "express";
import bodyParser from "body-parser";
import { Command } from "commander";
import { Canvas } from "canvas";
import type { ScheduledSlot } from "./slots.ts";
import { scheduledSlots } from "./slots.ts";
import path from "path";

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

app.use(express.static("public"));

const toRegularTime = (militaryTime) => {
  const [hours, minutes, seconds] = militaryTime.split(":");
  return `${hours > 12 ? hours - 12 : hours}:${minutes}${
    seconds ? `:${seconds}` : ""
  } ${hours >= 12 ? "PM" : "AM"}`;
};

function getNextScheduledSlot() {
  const hour = new Date().getHours();

  return scheduledSlots.sort(
    (a, b) => a.start.hour - hour - (b.start.hour - hour)
  )[0];
}

function buildMessage(slot: ScheduledSlot | null) {
  if (slot === null) return;

  let friendlyEnd: string;

  if (slot.name === "Default slot") {
    const nextSlot = getNextScheduledSlot();
    friendlyEnd = toRegularTime(
      `${nextSlot.start.hour}:${nextSlot.start.minute || "00"}`
    );
    return `${nextSlot.name} will start at ${friendlyEnd}`;
  } else {
    friendlyEnd = toRegularTime(`${slot.end.hour}:${slot.end.minute || "00"}`);
    return `${slot.name} will end at ${friendlyEnd}`;
  }
}

app.get("/active_slot", (req, res) => {
  const slot = overrideSlot || activeSlot;
  res.json({ message: buildMessage(slot), slot });
});

app.post("/nap", (req, res) => {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();

  overrideSlot = {
    name: "Nap",
    start: { hour: hour, minute },
    end: { hour: hour + 2, minute },
    macros: [scene({ sceneName: "bunny" })],
  };

  res.send();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/preview", (req, res) => {
  res.setHeader("Content-Type", "image/png");
  canvas.createPNGStream().pipe(res);
});

app.listen(port, () => {
  console.log(`BigDots listening on port ${port}`);
});

let overrideSlot: ScheduledSlot | null = null;
let activeSlot: ScheduledSlot | null = null;

function loop() {
  const hour = new Date().getHours();

  let slotFound = false;

  if (overrideSlot) {
    engine.render(overrideSlot.macros);
    activeSlot = overrideSlot;
    slotFound = true;
  } else {
    for (const schedulesSlot of scheduledSlots) {
      if (hour >= schedulesSlot.start.hour || hour <= schedulesSlot.end.hour) {
        if (
          JSON.stringify(activeSlot?.macros) !==
          JSON.stringify(schedulesSlot.macros)
        ) {
          engine.render(schedulesSlot.macros);
        } else {
        }

        activeSlot = schedulesSlot;
        slotFound = true;
      }
    }
  }

  if (!slotFound) {
    activeSlot = {
      name: "Default slot",
      start: { hour: 0 },
      end: { hour: 23 },
      macros: [
        coordinates({
          coordinates: {
            "0:0": "rgba(255, 255, 255, 0.1)",
            "1:0": "rgba(255, 255, 255, 0.05)",
          },
        }),
      ],
    };
    engine.render(activeSlot?.macros);
  }
}

setInterval(loop, 1000);
