import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { CalendarItem, EventItem } from "@/types/calendar";

const dataDir = path.join(process.cwd(), "data");
const calendarsPath = path.join(dataDir, "calendars.json");
const eventsPath = path.join(dataDir, "events.json");

let writeQueue = Promise.resolve();

async function ensureFile(filePath: string, fallback: unknown) {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
  }
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  await ensureFile(filePath, fallback);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function atomicWrite<T>(filePath: string, value: T) {
  const temp = `${filePath}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(temp, filePath);
}

export async function readCalendars() {
  return readJson<CalendarItem[]>(calendarsPath, []);
}

export async function readEvents() {
  return readJson<EventItem[]>(eventsPath, []);
}

export async function updateEvents(mutator: (events: EventItem[]) => EventItem[]) {
  const task = writeQueue.then(async () => {
    const events = await readEvents();
    const updated = mutator(events);
    await atomicWrite(eventsPath, updated);
    return updated;
  });
  writeQueue = task.then(() => undefined, () => undefined);
  return task;
}
