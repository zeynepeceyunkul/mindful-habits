import { useState, useEffect } from "react";
import { todayString } from "../utils/date";

const JOURNAL_KEY = "journal";

export default function Journal() {
  const [journal, setJournal] = useState(() => {
    const stored = localStorage.getItem(JOURNAL_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const [selectedDate, setSelectedDate] = useState(todayString());
  const [journalText, setJournalText] = useState(journal[selectedDate] || "");

  // Update text when date changes
  useEffect(() => {
    setJournalText(journal[selectedDate] || "");
  }, [selectedDate, journal]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
  }, [journal]);

  const saveJournal = () => {
    if (!journalText.trim()) {
      // Delete entry if empty
      const newJournal = { ...journal };
      delete newJournal[selectedDate];
      setJournal(newJournal);
      return;
    }
    setJournal((prev) => ({ ...prev, [selectedDate]: journalText }));
  };

  // Get last 30 days
  const getLast30Days = () => {
    return [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split("T")[0];
    });
  };

  const last30Days = getLast30Days();
  const today = todayString();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Today";
    }
    if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const hasEntry = (date) => journal[date] && journal[date].trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Journal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reflect on your day and track your thoughts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CALENDAR SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sticky top-4">
            <h2 className="font-semibold text-slate-700 mb-3">Recent Days</h2>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {last30Days.reverse().map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedDate === date
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{formatDate(date)}</span>
                    {hasEntry(date) && (
                      <span className="text-indigo-500">📝</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* JOURNAL EDITOR */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {formatDate(selectedDate)}
              </h2>
              {selectedDate === today && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  Today
                </span>
              )}
            </div>

            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              onBlur={saveJournal}
              rows={15}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none text-slate-700 leading-relaxed"
              placeholder="Write about your day, thoughts, achievements, or anything you want to remember..."
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {journalText.length} characters
              </p>
              <button
                onClick={saveJournal}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Save Entry
              </button>
            </div>

            {hasEntry(selectedDate) && (
              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <p className="text-xs text-indigo-700">
                  💾 Entry saved automatically
                </p>
              </div>
            )}
          </div>

          {/* STATS */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
              <p className="text-sm text-slate-600">Total Entries</p>
              <p className="text-2xl font-bold text-indigo-600">
                {Object.keys(journal).filter((k) => hasEntry(k)).length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
              <p className="text-sm text-slate-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {
                  Object.keys(journal).filter(
                    (k) =>
                      hasEntry(k) &&
                      new Date(k).getMonth() === new Date().getMonth()
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

