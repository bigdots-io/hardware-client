import { Macro, SceneName } from "@bigdots-io/display-engine";

export interface Panel {
  activeSlot: Slot | null;
  macros: Macro[];
}

export interface Slot {
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
  scene: SceneName;
}
