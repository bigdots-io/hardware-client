import { SceneName } from "@bigdots-io/display-engine";
import { Slot } from "../types";
import fs from "fs";

function loadPersistedData(): Partial<DataTypes> {
  try {
    const file = fs.readFileSync(`./database.json`).toString();
    return JSON.parse(file);
  } catch {
    return {
      [DataKey.ScheduledSlots]: [
        {
          start: { hour: 18, minute: 0 },
          end: { hour: 6, minute: 30 },
          scene: "moon",
        },
      ],
      [DataKey.OverrideSlot]: null,
    };
  }
}

export enum DataKey {
  ScheduledSlots = "scheduledSlots",
  OverrideSlot = "overrideSlot",
  ActiveSlot = "activeSlot",
  ActiveScheduledSlot = "activeScheduledSlot",
}

export interface DataTypes {
  scheduledSlots: Slot[];
  overrideSlot: Slot | null;
  activeSlot: Slot;
  activeScheduledSlot: Slot | null;
}

const db: DataTypes = {
  [DataKey.ScheduledSlots]: [],
  [DataKey.OverrideSlot]: null,
  [DataKey.ActiveSlot]: {
    start: { hour: 0, minute: 0 },
    end: { hour: 23, minute: 59 },
    scene: "nothing" as SceneName,
  },
  [DataKey.ActiveScheduledSlot]: null,
  ...loadPersistedData(),
};

export function get<K extends DataKey>(key: K): DataTypes[K] {
  return db[key];
}

export function set<K extends DataKey>(key: K, value: DataTypes[K]) {
  db[key] = value;
  fs.writeFileSync("database.json", JSON.stringify(db, null, 2));
}
