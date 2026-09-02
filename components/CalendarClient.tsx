'use client';

import { useMemo, useState } from "react";
import type { CalendarItem, EventItem } from "@/types/calendar";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function dateKey(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

export default function CalendarClient({ initialCalendar, initialEvents }: { initialCalendar: CalendarItem; initialEvents: EventItem[] }) {
  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState(initialEvents);
  const [modal, setModal] = useState<"event" | "password" | null>(null);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [pendingAction, setPendingAction] = useState<"edit" | "delete" | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    title: "", date: dateKey(today.getFullYear(), today.getMonth(), today.getDate()),
    startTime: "09:00", endTime: "10:00", description: "", location: "", category: "General", reminder: "15", notes: ""
  });

  const days = useMemo(() => {
    const y = view.getFullYear(), m = view.getMonth();
    const first = new Date(y, m, 1).getDay();
    const count = new Date(y, m + 1, 0).getDate();
    const prevCount = new Date(y, m, 0).getDate();
    const cells: { day: number; key: string; current: boolean }[] = [];
    for (let i = first - 1; i >= 0; i--) {
      const d = prevCount - i;
      const date = new Date(y, m - 1, d);
      cells.push({ day: d, key: dateKey(date.getFullYear(), date.getMonth(), d), current: false });
    }
    for (let d = 1; d <= count; d++) cells.push({ day: d, key: dateKey(y, m, d), current: true });
    while (cells.length < 42) {
      const d = cells.length - (first + count) + 1;
      const date = new Date(y, m + 1, d);
      cells.push({ day: d, key: dateKey(date.getFullYear(), date.getMonth(), d), current: false });
    }
    return cells;
  }, [view]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function openNew(date?: string) {
    setEditing(null);
    setForm({ title: "", date: date || dateKey(view.getFullYear(), view.getMonth(), 1), startTime: "09:00", endTime: "10:00", description: "", location: "", category: "General", reminder: "15", notes: "" });
    setModal("event");
  }

  function openExisting(event: EventItem) {
    setEditing(event);
    setForm({
      title: event.title, date: event.date, startTime: event.startTime, endTime: event.endTime,
      description: event.description || "", location: event.location || "", category: event.category || "General",
      reminder: event.reminder || "", notes: event.notes || ""
    });
    setPendingAction("edit"); setPassword(""); setPasswordError(""); setModal("password");
  }

  async function saveEvent() {
    if (!form.title.trim()) return notify("Please enter an event title.");
    const url = editing ? `/api/events/${editing.id}` : "/api/events";
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, password } : { ...form, calendarId: initialCalendar.id };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) return notify(data.error || "Could not save event.");
    setEvents((current) => editing ? current.map(e => e.id === data.id ? data : e) : [...current, data]);
    setModal(null); setPassword(""); notify(editing ? "Event updated" : "Event saved");
  }

  async function confirmPassword() {
    const res = await fetch("/api/verify-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (!res.ok) { setPasswordError("Incorrect password. Please try again."); return; }
    if (pendingAction === "edit") setModal("event");
    if (pendingAction === "delete") await deleteEvent();
    setPasswordError("");
  }

  async function deleteEvent() {
    if (!editing) return;
    const res = await fetch(`/api/events/${editing.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await res.json();
    if (!res.ok) return notify(data.error || "Could not delete event.");
    setEvents(current => current.filter(e => e.id !== editing.id));
    setModal(null); setEditing(null); setPassword(""); notify("Event deleted");
  }

  function share() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: initialCalendar.name, url }).catch(() => {});
    else navigator.clipboard.writeText(url).then(() => notify("Calendar link copied"));
  }

  const isToday = (key: string) => key === dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.28em] text-[#9a8a70]">IMPROX GROUP</div>
            <h1 className="text-2xl font-semibold tracking-[-.03em] sm:text-3xl">{initialCalendar.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setView(new Date(today.getFullYear(), today.getMonth(), 1))} className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:bg-white">Today</button>
            <button onClick={share} className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:bg-white">Share</button>
            <button onClick={() => openNew()} className="rounded-full bg-[#2d2a25] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">+ Add Event</button>
          </div>
        </header>

        <section className="luxury-shadow overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-5 sm:px-8">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">{months[view.getMonth()]} {view.getFullYear()}</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Select a date to add an event</p>
            </div>
            <div className="flex gap-2">
              <button aria-label="Previous month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] transition hover:bg-white">‹</button>
              <button aria-label="Next month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] transition hover:bg-white">›</button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-[var(--line)]">
            {weekdays.map(day => <div key={day} className="px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-[.15em] text-[var(--muted)] sm:py-4 sm:text-xs">{day}</div>)}
          </div>

          <div className="grid grid-cols-7">
            {days.map((cell, i) => {
              const dayEvents = events.filter(e => e.calendarId === initialCalendar.id && e.date === cell.key);
              return (
                <div key={cell.key} onDoubleClick={() => openNew(cell.key)} className={`group min-h-[110px] border-b border-r border-[var(--line)] p-2 transition sm:min-h-[145px] sm:p-3 ${cell.current ? "bg-[var(--surface)]" : "bg-[#f4f0e9]/45"} hover:bg-white`}>
                  <div className="mb-2 flex items-center justify-between">
                    <button onClick={() => openNew(cell.key)} className={`grid h-7 w-7 place-items-center rounded-full text-xs transition ${isToday(cell.key) ? "bg-[#2d2a25] text-white" : "text-[var(--muted)] hover:bg-[#ece7de]"}`}>{cell.day}</button>
                    {dayEvents.length > 0 && <span className="text-[10px] text-[var(--muted)]">{dayEvents.length}</span>}
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.map(event => (
                      <button key={event.id} onClick={() => openExisting(event)} className="w-full rounded-xl border border-[#e3dbce] bg-[#f1ece3] px-2.5 py-2 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                        <div className="truncate text-[11px] font-semibold sm:text-xs">{event.title}</div>
                        <div className="mt-0.5 text-[9px] text-[#8d8477] sm:text-[10px]">{event.startTime}–{event.endTime}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {modal === "event" && (
        <div className="modal-backdrop fixed inset-0 z-50 grid place-items-center p-4">
          <div className="fade-up luxury-shadow max-h-[90vh] w-full max-w-xl overflow-auto rounded-[28px] border border-[var(--line)] bg-[#fbfaf7] p-6 sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div><div className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#9a8a70]">{editing ? "Edit event" : "New event"}</div><h3 className="mt-1 text-2xl font-semibold">{editing ? "Refine your plans" : "Add to your calendar"}</h3></div>
              <button onClick={() => setModal(null)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)]">×</button>
            </div>
            <div className="space-y-4">
              <Field label="Event title"><input autoFocus value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Leadership meeting" /></Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Date"><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} /></Field>
                <Field label="Start"><input type="time" value={form.startTime} onChange={e => setForm({...form,startTime:e.target.value})} /></Field>
                <Field label="End"><input type="time" value={form.endTime} onChange={e => setForm({...form,endTime:e.target.value})} /></Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Location"><input value={form.location} onChange={e => setForm({...form,location:e.target.value})} placeholder="Optional" /></Field>
                <Field label="Category"><select value={form.category} onChange={e => setForm({...form,category:e.target.value})}><option>General</option><option>Meeting</option><option>Client</option><option>Personal</option><option>Deadline</option></select></Field>
              </div>
              <Field label="Description"><textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Add a little context..." /></Field>
              <Field label="Notes"><textarea rows={2} value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} placeholder="Optional notes" /></Field>
            </div>
            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {editing && <button onClick={() => {setPendingAction("delete");setPassword("");setPasswordError("");setModal("password")}} className="rounded-full border border-[#ded4c6] px-5 py-2.5 text-sm transition hover:bg-[#f1ece3]">Delete</button>}
              <button onClick={() => setModal(null)} className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={saveEvent} className="rounded-full bg-[#2d2a25] px-6 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5">{editing ? "Save Changes" : "Save Event"}</button>
            </div>
          </div>
        </div>
      )}

      {modal === "password" && (
        <div className="modal-backdrop fixed inset-0 z-[60] grid place-items-center p-4">
          <div className="fade-up luxury-shadow w-full max-w-sm rounded-[28px] border border-[var(--line)] bg-[#fbfaf7] p-7">
            <div className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#9a8a70]">Protected action</div>
            <h3 className="mt-2 text-xl font-semibold">{pendingAction === "delete" ? "Delete event" : "Edit event"}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Enter the Improx password to continue.</p>
            <input type="password" autoFocus value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmPassword()} className="mt-5 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[#9a8a70]" placeholder="Password" />
            {passwordError && <p className="mt-2 text-xs text-[#9b5c52]">{passwordError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setModal(editing ? "event" : null)} className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm">Cancel</button>
              <button onClick={confirmPassword} className="rounded-full bg-[#2d2a25] px-5 py-2.5 text-sm font-medium text-white">{pendingAction === "delete" ? "Continue" : "Unlock"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-[var(--line)] bg-[#2d2a25] px-5 py-3 text-sm text-white shadow-xl">{toast}</div>}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--muted)]">{label}</span>{children}</label>;
}
