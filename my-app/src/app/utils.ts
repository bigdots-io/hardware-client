import { Slot } from "./types.ts";

export const toRegularTime = (militaryTime: string) => {
  const [rawHour, minutes, seconds] = militaryTime.split(":");

  const numHour = +rawHour;
  const hour = numHour > 12 ? numHour - 12 : numHour === 0 ? 12 : numHour;

  return `${hour}:${minutes}${seconds ? `:${seconds}` : ""} ${
    numHour >= 12 ? "PM" : "AM"
  }`;
};

export function formattedMinute(minute: number) {
  return `${minute}`.length === 1 ? `0${minute}` : minute;
}

export function formatSlotEndingTime(slot: Slot) {
  if (slot.scene === "nothing") {
    return "Forever";
  } else {
    return toRegularTime(
      `${slot.end.hour}:${formattedMinute(slot.end.minute)}`
    );
  }
}

export function formatActiveSlotScene(slot: Slot) {
  if (slot.scene === "nothing") {
    return `No schedule`;
  } else {
    return `Showing ${slot.scene} until...`;
  }
}

function isBetweenSlotHours({ slot, hour }: { slot: Slot; hour: number }) {
  if (slot.start.hour <= slot.end.hour) {
    return hour >= slot.start.hour && hour <= slot.end.hour;
  } else {
    return hour >= slot.start.hour || hour <= slot.end.hour;
  }
}

export function isSlotActive(slot: Slot | null): boolean {
  if (slot === null) return false;

  const hour = new Date().getHours();
  const minute = new Date().getMinutes();

  if (isBetweenSlotHours({ slot, hour })) {
    if (hour === slot.end.hour) {
      return minute < slot.end.minute;
    }

    if (hour === slot.start.hour) {
      return minute >= slot.start.minute;
    }

    return true;
  }

  return false;
}
