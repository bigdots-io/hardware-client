import { scene } from "@bigdots-io/display-engine";

export const scheduledSlots = [
  {
    start: { hour: 18 },
    end: { hour: 6 },
    macros: [scene({ sceneName: "moon" })],
  },
];
