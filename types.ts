import { Macro } from "@bigdots-io/display-engine";

export interface Slot {
  name: string;
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
  macros: Macro[];
}
