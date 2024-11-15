import type { Macro } from "@bigdots-io/display-engine";
import { scene } from "@bigdots-io/display-engine";

export interface ScheduledSlot {
  name: string;
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
  macros: Macro[];
}

export const scheduledSlots: ScheduledSlot[] = [
  {
    name: "Bedtime",
    start: { hour: 18, minute: 0 },
    end: { hour: 5, minute: 30 },
    macros: [scene({ sceneName: "moon" })],
  },
];
