import type { Macro } from "@bigdots-io/display-engine";
import { scene } from "@bigdots-io/display-engine";

export interface Slot {
  name: string;
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
  macros: Macro[];
}

export const scheduledSlots: Slot[] = [
  {
    name: "Bedtime",
    start: { hour: 18, minute: 0 },
    end: { hour: 6, minute: 30 },
    macros: [scene({ sceneName: "moon" })],
  },
];
