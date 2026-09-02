import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { readEvents, updateEvents } from "@/lib/json-storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get("calendarId");
  const events = await readEvents();
  return NextResponse.json(calendarId ? events.filter((e) => e.calendarId === calendarId) : events);
}

export async function POST(request: Request) {
  const body = await request.json();
  const required = ["calendarId", "title", "date", "startTime", "endTime"];
  if (required.some((key) => !String(body[key] ?? "").trim())) {
    return NextResponse.json({ error: "Required event fields are missing." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const event = {
    id: `event-${randomUUID()}`,
    calendarId: String(body.calendarId),
    title: String(body.title).trim(),
    date: String(body.date),
    startTime: String(body.startTime),
    endTime: String(body.endTime),
    description: String(body.description ?? ""),
    location: String(body.location ?? ""),
    category: String(body.category ?? "General"),
    reminder: String(body.reminder ?? ""),
    notes: String(body.notes ?? ""),
    createdAt: now,
    updatedAt: now
  };

  await updateEvents((events) => [...events, event]);
  return NextResponse.json(event, { status: 201 });
}
