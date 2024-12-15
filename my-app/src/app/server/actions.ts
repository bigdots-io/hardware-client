"use server";

import { coordinates } from "@bigdots-io/display-engine";
import fs from "fs";
import { revalidatePath } from "next/cache";
import { Panel, Slot } from "../types";
import { DataKey, get, set } from "./db";
import { isSlotActive } from "../utils";

export async function getPanel(): Promise<Panel> {
  const activeSlot = get(DataKey.ActiveSlot);

  return {
    activeSlot,
    macros: [
      coordinates({
        coordinates: await getSceneData(activeSlot?.scene || "nothing"),
      }),
    ],
  };
}

export async function getScenes() {
  return fs.readdirSync("../scenes").map((file) => file.split(".")[0]);
}

export async function setActiveSlot(slot: Slot | null) {
  set(DataKey.ActiveSlot, slot);
  revalidatePath("/");
}

export async function changeOverrideTime(amount: number) {
  const newEnd = new Date();

  const activeSlot = get(DataKey.ActiveSlot);

  if (activeSlot) {
    newEnd.setHours(activeSlot?.end.hour);
    newEnd.setMinutes(activeSlot?.end.minute + amount);

    const hour = newEnd.getHours();
    const minute = newEnd.getMinutes();

    activeSlot.end = { hour, minute };
  }

  set(DataKey.ActiveSlot, activeSlot);

  reloadPanelState();

  revalidatePath("/");
}

export async function getSceneData(name: string) {
  const file = fs.readFileSync(`../scenes/${name}.json`).toString();
  return JSON.parse(file);
}

export async function reloadPanelState() {
  const activeSlot = get(DataKey.ActiveSlot);

  if (!isSlotActive(activeSlot)) {
    set(DataKey.ActiveSlot, null);
  }
}

setInterval(() => reloadPanelState(), 1000);
