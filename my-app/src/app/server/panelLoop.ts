"use server";

import { coordinates, SceneName } from "@bigdots-io/display-engine";
import { isSlotActive } from "../utils.ts";
import { DataKey, get, set } from "./db.ts";
import fs from "fs";

function getSceneData(name: string) {
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
        // engine?.render([
        //   coordinates({
        //     coordinates: await getSceneData(slotToActivate.scene),
        //   }),
        // ]);
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
      // engine?.render([
      //   coordinates({
      //     coordinates: await getSceneData(slotToActivate.scene),
      //   }),
      // ]);
    }

    set(DataKey.ActiveScheduledSlot, null);
    set(DataKey.ActiveSlot, slotToActivate);
  }
}
