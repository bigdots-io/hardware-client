import { Slot } from "../types.ts";
import fs from "fs";

function loadPersistedData(): Partial<DataTypes> {
  try {
    const file = fs.readFileSync(`./database.json`).toString();
    return JSON.parse(file);
  } catch {
    return {
      [DataKey.ActiveSlot]: null,
    };
  }
}

export enum DataKey {
  ActiveSlot = "activeSlot",
}

export interface DataTypes {
  activeSlot: Slot | null;
}

const db: DataTypes = {
  [DataKey.ActiveSlot]: null,
  ...loadPersistedData(),
};

export function get<K extends DataKey>(key: K): DataTypes[K] {
  return db[key];
}

export function set<K extends DataKey>(key: K, value: DataTypes[K]) {
  if (JSON.stringify(get(key)) === JSON.stringify(value)) {
    return;
  }

  db[key] = JSON.parse(JSON.stringify(value));
  fs.writeFileSync("database.json", JSON.stringify(db, null, 2));
}
