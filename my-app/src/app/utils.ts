import { Panel, Slot } from "./types.ts";

export const toRegularTime = (militaryTime: string) => {
  const [hours, minutes, seconds] = militaryTime.split(":");

  const h = +hours;
  return `${h > 12 ? h - 12 : h}:${minutes}${seconds ? `:${seconds}` : ""} ${
    h >= 12 ? "PM" : "AM"
  }`;
};

export function getNextScheduledSlot(scheduledSlots: Slot[]) {
  const hour = new Date().getHours();

  return scheduledSlots.sort(
    (a, b) => a.start.hour - hour - (b.start.hour - hour)
  )[0];
}

export function formattedMinute(minute: number) {
  if (`${minute}`.length === 1) {
    return `0${minute}`;
  }
  return minute;
}

export function buildMessage({ activeSlot, scheduledSlots }: Panel) {
  if (activeSlot === null) return;

  let friendlyEnd: string;

  if (activeSlot.scene === "nothing") {
    const nextSlot = getNextScheduledSlot(scheduledSlots);
    if (!nextSlot) return "No scheduled slots";
    friendlyEnd = toRegularTime(
      `${nextSlot.start.hour}:${formattedMinute(nextSlot.start.minute)}`
    );
    return `${nextSlot.scene} will start at ${friendlyEnd}`;
  } else {
    friendlyEnd = toRegularTime(
      `${activeSlot.end.hour}:${formattedMinute(activeSlot.end.minute)}`
    );
    return `Until ${friendlyEnd}`;
  }
}

export function isSlotActive(slot: Slot | null): boolean {
  if (slot === null) return false;

  const hour = new Date().getHours();
  const minute = new Date().getMinutes();

  if (hour >= slot.start.hour || hour <= slot.end.hour) {
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

export async function wait(ms: number) {
  return new Promise<void>(async (resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
