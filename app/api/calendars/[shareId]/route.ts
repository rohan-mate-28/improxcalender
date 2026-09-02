import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { readCalendars, readEvents } from "@/lib/json-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  const calendars = await readCalendars();
  const calendar = calendars.find((item) => item.shareId === shareId);
  if (!calendar) return NextResponse.json({ error: "Calendar not found" }, { status: 404 });

  const events = (await readEvents()).filter((event) => event.calendarId === calendar.id);
  return NextResponse.json({ calendar, events });
}
