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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">
            Daily Reminder
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Get notified at your chosen time to complete your habits
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
        </label>
      </div>

      {/* TIME SETTING */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Reminder Time
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          disabled={!enabled}
          className="block w-full max-w-xs px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* PERMISSION STATUS */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">
              Notification Permission
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {permission === "granted"
                ? "✅ Notifications are enabled"
                : permission === "denied"
                ? "❌ Notifications are blocked"
                : permission === "unsupported"
                ? "⚠️ Notifications not supported in this browser"
                : "⏳ Permission not yet requested"}
            </p>
          </div>

          {permission !== "granted" &&
            permission !== "unsupported" && (
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {permission === "default" ? "Enable" : "Request Again"}
              </button>
            )}
        </div>
      </div>

      {/* NEXT REMINDER INFO */}
      {enabled && permission === "granted" && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-sm text-indigo-700">
            <span className="font-medium">Next reminder:</span>{" "}
            {nextTriggerDate.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}

      {/* TEST BUTTON */}
      {permission === "granted" && (
        <button
          onClick={() =>
            new Notification("Habit Tracker 🔔", {
              body: "This is a test notification. Your daily reminder is working!",
              icon: "/vite.svg",
            })
          }
          className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Test Notification
        </button>
      )}

      {!enabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700">
            💡 Turn on reminders to get daily notifications about your habits
          </p>
        </div>
      )}
    </div>
  );
}
