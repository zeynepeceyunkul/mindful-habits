import { useEffect, useState } from "react";
import WeeklyStats from "../components/WeeklyStats";
import Reminders from "../components/Reminders";

import { getDailyQuote } from "../utils/dailyQuote";
import { todayString } from "../utils/date";

const STORAGE_KEY = "habits";
const JOURNAL_KEY = "journal";
const QUOTE_KEY = "daily_quote";
const QUOTE_DATE_KEY = "quote_date";

export default function Dashboard({ habits, setHabits }) {
  const today = todayString();

  /* ---------------- STATE ---------------- */
  const [journal, setJournal] = useState(
    JSON.parse(localStorage.getItem(JOURNAL_KEY) || "{}")
  );
  const [journalText, setJournalText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [habitType, setHabitType] = useState("boolean");
  const [habitTarget, setHabitTarget] = useState("");
  const [habitUnit, setHabitUnit] = useState("");
  const [habitIcon, setHabitIcon] = useState("✨");

  /* ---------------- DAILY QUOTE ---------------- */
  const [dailyQuote] = useState(() => {
    const savedQuote = localStorage.getItem(QUOTE_KEY);
    const savedDate = localStorage.getItem(QUOTE_DATE_KEY);

    if (savedQuote && savedDate === today) return savedQuote;

    const quote = getDailyQuote(today);
    localStorage.setItem(QUOTE_KEY, quote);
    localStorage.setItem(QUOTE_DATE_KEY, today);
    return quote;
  });

  /* ---------------- PERSISTENCE ---------------- */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
  }, [journal]);

  /* ---------------- ADD HABIT ---------------- */
  const addHabit = () => {
    if (!newHabitTitle.trim()) return;

    const newHabit = {
      id: crypto.randomUUID(),
      title: newHabitTitle,
      type: habitType,
      icon: habitIcon,
      startDate: new Date().toISOString(),
      completedDates: [],
    };

    if (habitType === "numeric") {
      if (!habitTarget || !habitUnit) return;
      newHabit.target = Number(habitTarget);
      newHabit.unit = habitUnit;
    }

    setHabits((prev) => [...prev, newHabit]);

    setNewHabitTitle("");
    setHabitType("boolean");
    setHabitTarget("");
    setHabitUnit("");
    setHabitIcon("✨");
    setIsModalOpen(false);
  };

  /* ---------------- JOURNAL ---------------- */
  const saveJournal = () => {
    if (!journalText.trim()) return;
    setJournal((prev) => ({ ...prev, [today]: journalText }));
    setJournalText("");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* QUOTE */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center">
        <p className="italic text-slate-700">“{dailyQuote}”</p>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-slate-800">
          Dashboard
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl"
        >
          + Add Habit
        </button>
      </div>

      {/* STATS */}
      <WeeklyStats habits={habits} />
      <Reminders />

      {/* JOURNAL */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl">
        <h2 className="font-medium text-slate-700 mb-2">
          Today’s Journal
        </h2>

        <textarea
          rows={3}
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="How was your day?"
        />

        <button
          onClick={saveJournal}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-xl"
        >
          Save Journal
        </button>

        {journal[today] && (
          <p className="text-sm text-slate-500 mt-2">
            <strong>Today:</strong> {journal[today]}
          </p>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 space-y-4 border border-slate-200">

            <h2 className="text-lg font-semibold text-slate-800">
              Add New Habit
            </h2>

            <input
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder="Habit title"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setHabitType("boolean")}
                className={`flex-1 p-2 rounded-xl ${
                  habitType === "boolean"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                ✔️ Check
              </button>

              <button
                onClick={() => setHabitType("numeric")}
                className={`flex-1 p-2 rounded-xl ${
                  habitType === "numeric"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                🔢 Number
              </button>
            </div>

            {habitType === "numeric" && (
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Target"
                  value={habitTarget}
                  onChange={(e) => setHabitTarget(e.target.value)}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  placeholder="Unit (L, min...)"
                  value={habitUnit}
                  onChange={(e) => setHabitUnit(e.target.value)}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-slate-500">Icon</label>
              <div className="flex gap-2 mt-1">
                {["✨", "💧", "🏃‍♀️", "📖", "🧘‍♀️", "📝"].map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setHabitIcon(icon)}
                    className={`text-xl p-2 rounded-xl ${
                      habitIcon === icon
                        ? "bg-indigo-100"
                        : "bg-slate-100"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={addHabit}
                disabled={
                  !newHabitTitle.trim() ||
                  (habitType === "numeric" &&
                    (!habitTarget || !habitUnit))
                }
                className={`px-4 py-1 rounded-xl text-white ${
                  !newHabitTitle.trim() ||
                  (habitType === "numeric" &&
                    (!habitTarget || !habitUnit))
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600"
                }`}
              >
                Add
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
