"use client";

import { useMemo, useState } from "react";
import { useDesktop } from "../desktop/DesktopContext";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthMatrix = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix: Array<Array<{ date: Date; inMonth: boolean }>> = [];
  const current = new Date(firstDay);
  current.setDate(current.getDate() - current.getDay());

  while (current <= lastDay || current.getDay() !== 0) {
    const week: Array<{ date: Date; inMonth: boolean }> = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        date: new Date(current),
        inMonth: current.getMonth() === month,
      });
      current.setDate(current.getDate() + 1);
    }
    matrix.push(week);
  }

  return matrix;
};

export default function CalendarApp() {
  const { events, setEvents, openApp, pushNotification } = useDesktop();
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const monthMatrix = useMemo(() => {
    return getMonthMatrix(referenceDate.getFullYear(), referenceDate.getMonth());
  }, [referenceDate]);

  const monthEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getMonth() === referenceDate.getMonth() &&
        eventDate.getFullYear() === referenceDate.getFullYear()
      );
    });
  }, [events, referenceDate]);

  const dayEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [events, selectedDate]);

  const addEvent = () => {
    const iso = selectedDate.toISOString().slice(0, 10);
    const id = `event-${Math.random().toString(36).slice(2, 9)}`;
    setEvents((prev) => [
      ...prev,
      {
        id,
        title: "New meeting",
        date: iso,
        time: "2:00 PM",
        location: "TBD",
        description: "Tap to edit details.",
      },
    ]);
    pushNotification({
      appId: "calendar",
      title: "Event added",
      body: `Scheduled for ${iso}`,
    });
  };

  return (
    <div className="flex h-full bg-slate-50/90">
      <section className="w-3/5 border-r border-slate-200/70 bg-white/90 p-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {referenceDate.toLocaleString("default", { month: "long" })}{" "}
              {referenceDate.getFullYear()}
            </h2>
            <p className="text-sm text-slate-500">
              {monthEvents.length} events this month
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <button
              className="rounded-full bg-slate-100 px-3 py-1"
              onClick={() =>
                setReferenceDate(
                  new Date(
                    referenceDate.getFullYear(),
                    referenceDate.getMonth() - 1,
                    1,
                  ),
                )
              }
            >
              ‹
            </button>
            <button
              className="rounded-full bg-slate-100 px-3 py-1"
              onClick={() =>
                setReferenceDate(
                  new Date(
                    referenceDate.getFullYear(),
                    referenceDate.getMonth() + 1,
                    1,
                  ),
                )
              }
            >
              ›
            </button>
            <button
              className="rounded-full bg-slate-900 px-3 py-1 font-medium text-white"
              onClick={() => setReferenceDate(new Date())}
            >
              Today
            </button>
          </div>
        </header>
        <div className="mt-6 grid grid-cols-7 gap-4 text-center text-sm text-slate-500">
          {WEEKDAYS.map((day) => (
            <span key={day} className="font-semibold uppercase tracking-wide">
              {day}
            </span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-4">
          {monthMatrix.flat().map((day) => {
            const dayEventsCount = events.filter((event) => {
              const eventDate = new Date(event.date);
              return (
                eventDate.getDate() === day.date.getDate() &&
                eventDate.getMonth() === day.date.getMonth() &&
                eventDate.getFullYear() === day.date.getFullYear()
              );
            }).length;
            const isToday =
              day.date.toDateString() === new Date().toDateString();
            const isSelected =
              day.date.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={`${day.date.toISOString()}-${day.inMonth}`}
                className={`flex h-24 flex-col items-center justify-center rounded-3xl border border-transparent bg-white/70 text-sm transition ${isSelected ? "border-blue-400 bg-blue-50/80" : ""} ${!day.inMonth ? "text-slate-300" : "text-slate-700"}`}
                onClick={() => setSelectedDate(new Date(day.date))}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold ${isToday ? "bg-blue-500 text-white" : ""}`}
                >
                  {day.date.getDate()}
                </span>
                <span className="text-xs text-slate-400">
                  {dayEventsCount} events
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="flex flex-1 flex-col bg-white/70">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <p className="text-sm text-slate-500">
              {dayEvents.length} scheduled event
              {dayEvents.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow"
            onClick={addEvent}
          >
            New Event
          </button>
        </header>
        <div className="macos-scrollbar flex-1 overflow-auto divide-y divide-slate-200">
          {dayEvents.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <p>No events scheduled.</p>
              <button
                className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
                onClick={addEvent}
              >
                Create Event
              </button>
            </div>
          ) : (
            dayEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-4 px-6 py-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-lg font-semibold text-white">
                  {event.time.split(":")[0]}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {event.title}
                  </h4>
                  <p className="text-sm text-slate-500">{event.time}</p>
                  {event.location && (
                    <p className="mt-1 text-sm text-slate-500">
                      📍 {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="mt-2 text-sm text-slate-600">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <footer className="border-t border-slate-200 bg-white/80 px-6 py-4 text-sm text-slate-500">
          Connected calendars: Personal, Work. Manage in{" "}
          <button
            className="text-blue-500 underline"
            onClick={() => openApp("settings")}
          >
            System Settings
          </button>
          .
        </footer>
      </section>
    </div>
  );
}
