import type { Pixel } from "@bigdots-io/display-engine";
import type { LedMatrixInstance, MatrixOptions } from "rpi-led-matrix";
import {
  box,
  coordinates,
  createDisplayEngine,
  text,
} from "@bigdots-io/display-engine";
import p1 from "./package.json" with { "type": "json" }

import { LedMatrix, GpioMapping } from "rpi-led-matrix";
import express from "express";
import bodyParser from "body-parser";
import { Command } from "commander";
import { defaultScheduledSlots } from "./slots.ts";
import type { Slot } from "./slots.ts";
import { createCanvas } from "canvas";
import fs  from 'fs';

const program = new Command();

function loadSlots() {
  try {
    const file = fs.readFileSync(`./database.json`).toString();
    return JSON.parse(file).slots;
  } catch(e) {
    return defaultScheduledSlots
  }
}

let scheduledSlots = loadSlots();

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
let updateQueue: Pixel[][] = [];

const canvas = createCanvas(
  parseInt(options.cols, 10),
  parseInt(options.rows, 10)
);
const ctx = canvas.getContext("2d", { willReadFrequently: true });

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
    for (const pixel of pixels) {
      if (pixel.rgba && ctx) {
        const id = ctx.createImageData(1, 1);
        const data = id.data;
        data[0] = pixel.rgba[0];
        data[1] = pixel.rgba[1];
        data[2] = pixel.rgba[2];
        data[3] = pixel.rgba[3];
        ctx.putImageData(id, pixel.x, pixel.y);
      }
    }
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

function formattedMinute(minute) {
  if(`${minute}`.length=== 1) {
    return `0${minute}`
  }
  return minute
}

function buildMessage(slot: Slot | null) {
  if (slot === null) return;

  let friendlyEnd: string;

  if (slot.scene === "nothing") {
    const nextSlot = getNextScheduledSlot();
    friendlyEnd = toRegularTime(
      `${nextSlot.start.hour}:${formattedMinute(nextSlot.start.minute)}`
    );
    return `${nextSlot.scene} will start at ${friendlyEnd}`;
  } else {
    friendlyEnd = toRegularTime(`${slot.end.hour}:${formattedMinute(slot.end.minute)}`);
    return `${slot.scene} will end at ${friendlyEnd}`;
  }
}

app.get("/api/active_slot", (req, res) => {
  const slot = overrideSlot || activeSlot;
  res.json({ message: buildMessage(slot), slot, isOverride: !!overrideSlot });
});

app.get("/api/slots", (req, res) => {
  res.json({ slots: scheduledSlots });
});

app.get("/api/scenes", (req, res) => {
  const scenes = fs.readdirSync("../scenes").map(file => file.split('.')[0]);
  res.json(scenes);
});

app.get("/api/scenes/:name", (req, res) => {
  const scene = getSceneData(req.params.name)
  res.json(scene);
});

app.put("/api/scenes/:name", (req, res) => {
  const fileName = `../scenes/${req.params.name}.json`
  fs.writeFileSync(fileName, JSON.stringify(req.body.scene, null, 2));
  res.json(true);
});

app.post("/api/scenes", (req, res) => {
  console.log(req.body.name)
  const fileName = `../scenes/${req.body.name}.json`
  fs.writeFileSync(fileName, JSON.stringify({}, null, 2));
  res.json(true);
});

app.put("/api/slots", (req, res) => {
  scheduledSlots = req.body.slots
  fs.writeFileSync('database.json', JSON.stringify({slots: scheduledSlots}, null, 2));
  reloadPanel()
  res.send(true);
});

app.post("/api/nap", (req, res) => {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();

  overrideSlot = {
    start: { hour: hour, minute },
    end: { hour: hour + 2, minute },
    scene: "bunny"
  };
  reloadPanel()

  res.send();
});

app.post("/api/change_override_time", (req, res) => {
  const newEnd = new Date();

  if(overrideSlot) {
    newEnd.setHours(overrideSlot?.end.hour)
    newEnd.setMinutes(overrideSlot?.end.minute + parseInt(req.query.min as string, 10))

    const hour = newEnd.getHours();
    const minute = newEnd.getMinutes();

    overrideSlot.end = { hour, minute };
      
    reloadPanel()
  }

  res.send();
});

app.post("/api/clear_override", (req, res) => {
  overrideSlot = null;
  reloadPanel()
  res.send();
});

app.get("/api/preview", (req, res) => {
  res.setHeader("Content-Type", "image/png");
  ctx.scale(10, 10)
  canvas.createPNGStream().pipe(res);
});

app.listen(port, () => {
  console.log(`BigDots listening on port ${port}`);
});

let overrideSlot: Slot | null = null;
let activeSlot: Slot | null = null;

function isSlotActive(slot: Slot): boolean {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();

  if (hour >= slot.start.hour || hour <= slot.end.hour) {
    if (hour === slot.end.hour) {
      return minute < slot.end.minute;
    }

    if (hour === slot.start.hour) {
      return minute >= slot.start.minute;
    }

    return true;
  }

  return false;
}

function getSceneData(name) {
  const file = fs.readFileSync(`../scenes/${name}.json`).toString();
  return JSON.parse(file);
}

function reloadPanel() {
  let slotFound = false;

  if (overrideSlot) {
    if (isSlotActive(overrideSlot)) {
      if (
        JSON.stringify(activeSlot?.scene) !==
        JSON.stringify(overrideSlot.scene)
      ) {
        engine.render([coordinates({ coordinates: getSceneData(overrideSlot.scene)})]);
      }

      activeSlot = overrideSlot;
      slotFound = true;
    } else {
      overrideSlot = null;
    }
  } else {
    for (const scheduledSlot of scheduledSlots) {
      if (isSlotActive(scheduledSlot)) {
        if (
          JSON.stringify(activeSlot?.scene) !==
          JSON.stringify(scheduledSlot.scene)
        ) {
          engine.render([coordinates({ coordinates: getSceneData(scheduledSlot.scene)})]);
        }

        activeSlot = scheduledSlot;
        slotFound = true;
      }
    }
  }

  if (!slotFound) {
    activeSlot = {
      start: { hour: 0, minute: 0 },
      end: { hour: 23, minute: 59 },
      scene: "nothing"
    };
    engine.render([coordinates({ coordinates: getSceneData(activeSlot.scene)})]);
  }
}

async function wait(ms: number) {
  return new Promise<void>(async (resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function init() {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();

  return new Promise<void>(async (resolve) => {
    engine.render([
      box({ backgroundColor: "#660000" }),
      text({
        text: `${hour}:${minute}`,
        alignment: "center",
        startingRow: 2,
        fontSize: 13,
      }),
      text({
        text: `v ${p1["version"]}`,
        alignment: "center",
        startingRow: 18,
        fontSize: 8,
        color: '#DDDDDD'
      }),
    ]);

    await wait(2000);

    resolve();
  });
}

await init();

setInterval(reloadPanel, 1000);
