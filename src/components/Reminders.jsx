import { useEffect, useMemo, useRef, useState } from "react";

const REMINDER_KEY = "daily_reminder_time";
const REMINDER_ENABLED_KEY = "daily_reminder_enabled";
const LAST_FIRED_KEY = "daily_reminder_last_fired";

export default function Reminders() {
  const [enabled, setEnabled] = useState(() => {
    const v = localStorage.getItem(REMINDER_ENABLED_KEY);
    return v ? v === "true" : false;
  });

  const [time, setTime] = useState(() => {
    return localStorage.getItem(REMINDER_KEY) || "21:00";
  });

  const [permission, setPermission] = useState(() => {
    return typeof Notification !== "undefined"
      ? Notification.permission
      : "unsupported";
  });

  const timeoutRef = useRef(null);

  /* ------------------ PERSIST ------------------ */
  useEffect(() => {
    localStorage.setItem(REMINDER_ENABLED_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    localStorage.setItem(REMINDER_KEY, time);
  }, [time]);

  /* ------------------ NEXT TRIGGER ------------------ */
  const nextTriggerDate = useMemo(() => {
    const [hh, mm] = time.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hh, mm, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    return target;
  }, [time]);

  /* ------------------ SCHEDULER ------------------ */
  useEffect(() => {
    if (!enabled) return;
    if (permission !== "granted") return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const delay = nextTriggerDate.getTime() - Date.now();

    timeoutRef.current = setTimeout(() => {
      const today = new Date().toISOString().split("T")[0];
      const lastFired = localStorage.getItem(LAST_FIRED_KEY);

      if (lastFired !== today) {
        new Notification("Habit Tracker 🔔", {
          body: "Günlük alışkanlıklarını işaretlemeyi unutma!",
        });
        localStorage.setItem(LAST_FIRED_KEY, today);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, permission, nextTriggerDate]);

  /* ------------------ PERMISSION ------------------ */
  const requestPermission = async () => {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      return;
    }
    const res = await Notification.requestPermission();
    setPermission(res);
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="bg-white border p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Daily Reminder</h3>
          <p className="text-sm text-gray-500">
            Seçtiğin saatte hatırlatma gönderir.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span>On</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <div>
          <label className="text-sm text-gray-500">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="block border rounded px-2 py-1 mt-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Permission:</span>
          <span className="text-sm font-medium">{permission}</span>

          {permission !== "granted" &&
            permission !== "unsupported" && (
              <button
                onClick={requestPermission}
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Enable
              </button>
            )}
        </div>
      </div>

      {permission === "granted" && (
        <button
          onClick={() =>
            new Notification("Habit Tracker 🔔", {
              body: "Bu bir TEST bildirimidir.",
            })
          }
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Test Notification
        </button>
      )}
    </div>
  );
}
