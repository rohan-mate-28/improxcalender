import { NextResponse } from "next/server";
import { isEditPasswordValid } from "@/lib/auth";
import { updateEvents } from "@/lib/json-storage";

async function verify(request: Request) {
  const body = await request.clone().json().catch(() => ({}));
  return isEditPasswordValid(String(body.password ?? ""));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verify(request)) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const { id } = await params;
  const body = await request.json();

  let updatedEvent: any = null;
  await updateEvents((events) => events.map((event) => {
    if (event.id !== id) return event;
    updatedEvent = {
      ...event,
      title: String(body.title ?? event.title).trim(),
      date: String(body.date ?? event.date),
      startTime: String(body.startTime ?? event.startTime),
      endTime: String(body.endTime ?? event.endTime),
      description: String(body.description ?? ""),
      location: String(body.location ?? ""),
      category: String(body.category ?? "General"),
      reminder: String(body.reminder ?? ""),
      notes: String(body.notes ?? ""),
      updatedAt: new Date().toISOString()
    };
    return updatedEvent;
  }));

  if (!updatedEvent) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  return NextResponse.json(updatedEvent);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verify(request)) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const { id } = await params;
  let removed = false;
  await updateEvents((events) => events.filter((event) => {
    if (event.id === id) { removed = true; return false; }
    return true;
  }));
  if (!removed) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
