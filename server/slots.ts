import type { SceneName } from "@bigdots-io/display-engine";

export interface Slot {
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
  scene: SceneName;
}

export const defaultScheduledSlots: Slot[] = [
  {
    start: { hour: 18, minute: 0 },
    end: { hour: 6, minute: 30 },
    scene: "moon",
  },
];
