"use server";

import { coordinates, SceneName } from "@bigdots-io/display-engine";
import fs from "fs";
import { revalidatePath } from "next/cache";
import { Panel, Slot } from "../types";
import { DataKey, DataTypes, get, set } from "./db";
import { startPanelLoop } from "./panelLoop";
import { isSlotActive } from "../utils";

export async function getPanel(): Promise<Panel> {
  const activeSlot =
    get(DataKey.OverrideSlot) || get(DataKey.ActiveScheduledSlot);

  return {
    activeSlot: get(DataKey.ActiveSlot),
    scheduledSlot: get(DataKey.ActiveScheduledSlot),
    overrideSlot: get(DataKey.OverrideSlot),
    macros: [
      coordinates({
        coordinates: await getSceneData(activeSlot?.scene || "nothing"),
      }),
    ],
    scheduledSlots: get(DataKey.ScheduledSlots),
  };
}

export async function getScenes() {
  return fs.readdirSync("../scenes").map((file) => file.split(".")[0]);
}

export async function setOverrideSlot(slot: Slot | null) {
  set(DataKey.OverrideSlot, slot);
  reloadPanel();
  revalidatePath("/");
}

export async function updateScheduledSlots(
  newScheduledSlots: DataTypes[DataKey.ScheduledSlots]
) {
  set(DataKey.ScheduledSlots, newScheduledSlots);
  reloadPanel();
  revalidatePath("/");
}

export async function changeOverrideTime(amount: number) {
  const newEnd = new Date();

  const overrideSlot = get(DataKey.OverrideSlot);

  if (overrideSlot) {
    newEnd.setHours(overrideSlot?.end.hour);
    newEnd.setMinutes(overrideSlot?.end.minute + amount);

    const hour = newEnd.getHours();
    const minute = newEnd.getMinutes();

    overrideSlot.end = { hour, minute };
  }

  revalidatePath("/");
}

export async function getSceneData(name: string) {
  const file = fs.readFileSync(`../scenes/${name}.json`).toString();
  return JSON.parse(file);
}

export async function reloadPanel(engine?: any) {
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

startPanelLoop();
