"use server";

import { coordinates, createDisplayEngine } from "@bigdots-io/display-engine";
import type { Pixel, SceneName } from "@bigdots-io/display-engine";
import { createCanvas } from "canvas";
import { DataKey, set, get } from "./db";
import { isSlotActive } from "../utils";
import { getSceneData } from "./actions";
import type { LedMatrixInstance } from "rpi-led-matrix";
import { LedMatrix, GpioMapping } from "rpi-led-matrix";

function RGBAToHexA(rgba: Uint8ClampedArray, forceRemoveAlpha = false) {
  const hexValues = [...rgba]
    .filter((_number, index) => !forceRemoveAlpha || index !== 3)
    .map((number, index) => (index === 3 ? Math.round(number * 255) : number))
    .map((number) => number.toString(16));

  return hexValues
    .map((string) => (string.length === 1 ? "0" + string : string)) // Adds 0 when length of one number is 1
    .join("");
}

let matrix: LedMatrixInstance;
const updateQueue: Pixel[][] = [];

if (false) {
  // console.log("yo");
  // matrix = new LedMatrix(
  //   {
  //     ...LedMatrix.defaultMatrixOptions(),
  //     rows: 32,
  //     cols: 32,
  //     chainLength: 1,
  //     hardwareMapping: GpioMapping.Regular,
  //   },
  //   {
  //     ...LedMatrix.defaultRuntimeOptions(),
  //     gpioSlowdown: 2,
  //   }
  // );
  // matrix.afterSync(() => {
  //   // if (options.debug && updateQueue.length > 0) {
  //   //   console.log("Queue:", updateQueue.length);
  //   // }
  //   const pixelUpdates = updateQueue.shift();
  //   if (pixelUpdates) {
  //     for (const pixel of pixelUpdates) {
  //       matrix
  //         .brightness(30)
  //         .fgColor(
  //           parseInt(pixel.rgba ? RGBAToHexA(pixel.rgba, true) : "000000", 16)
  //         )
  //         .setPixel(pixel.x, pixel.y);
  //     }
  //   }
  //   setTimeout(() => matrix.sync(), 0);
  // });
  // matrix.sync();
}

const engine = createDisplayEngine({
  dimensions: {
    width: 32,
    height: 32,
  },
  onPixelsChange: (pixels) => {
    updateQueue.push(pixels);
  },
});

const canvas = createCanvas(32, 32);
const ctx = canvas.getContext("2d", { willReadFrequently: true });

export async function reloadPanel(engine: any) {
  let slotFound = false;

  const scheduledSlots = get(DataKey.ScheduledSlots);
  const overrideSlot = get(DataKey.OverrideSlot);
  const activeSlot = get(DataKey.ActiveSlot);

  for (const scheduledSlot of scheduledSlots) {
    if (isSlotActive(scheduledSlot)) {
      if (!isSlotActive(overrideSlot)) {
        set(DataKey.OverrideSlot, null);
      }

      const slotToActivate = overrideSlot || scheduledSlot;

      if (
        JSON.stringify(activeSlot?.scene) !==
        JSON.stringify(slotToActivate.scene)
      ) {
        engine?.render([
          coordinates({
            coordinates: await getSceneData(slotToActivate.scene),
          }),
        ]);
      }

      set(DataKey.ActiveScheduledSlot, scheduledSlot);
      set(DataKey.ActiveSlot, slotToActivate);

      slotFound = true;
    }
  }

  if (!slotFound) {
    if (!isSlotActive(overrideSlot)) {
      set(DataKey.OverrideSlot, null);
    }
    const blankSlot = {
      start: { hour: 0, minute: 0 },
      end: { hour: 23, minute: 59 },
      scene: "nothing" as SceneName,
    };

    const slotToActivate = overrideSlot || blankSlot;

    if (
      JSON.stringify(activeSlot?.scene) !== JSON.stringify(slotToActivate.scene)
    ) {
      engine?.render([
        coordinates({
          coordinates: await getSceneData(slotToActivate.scene),
        }),
      ]);
    }

    set(DataKey.ActiveScheduledSlot, null);
    set(DataKey.ActiveSlot, slotToActivate);
  }
}

export async function startPanelLoop() {
  reloadPanel();
  setInterval(reloadPanel, 1000);
}
