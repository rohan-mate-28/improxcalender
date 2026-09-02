export type EventItem = {
  id: string;
  calendarId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  category?: string;
  reminder?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CalendarItem = {
  id: string;
  name: string;
  shareId: string;
  createdAt: string;
  updatedAt: string;
};
