import { readCalendars, readEvents } from "@/lib/json-storage";
import CalendarClient from "@/components/CalendarClient";
import { notFound } from "next/navigation";

export default async function CalendarPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const calendars = await readCalendars();
  const calendar = calendars.find((item) => item.shareId === shareId);
  if (!calendar) notFound();
  const events = (await readEvents()).filter((event) => event.calendarId === calendar.id);
  return <CalendarClient initialCalendar={calendar} initialEvents={events} />;
}
