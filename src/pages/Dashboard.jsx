import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getDailyQuote } from "../utils/dailyQuote";
import { todayString } from "../utils/date";
import { calculateStreak } from "../utils/streak";

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

  const [numericValues, setNumericValues] = useState({});

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

  /* ---------------- HELPERS ---------------- */
  const isCompletedToday = (habit) =>
    habit.completedDates.some((c) =>
      typeof c === "string" ? c === today : c.date === today
    );

  /* ---------------- DERIVED DATA ---------------- */
  const todaysHabits = habits.filter(
    (h) => h.startDate.split("T")[0] <= today
  );

  const completedToday = habits.filter(isCompletedToday).length;
const completionPercent = habits.length
  ? Math.round((completedToday / habits.length) * 100)
  : 0;

  const bestStreak =
    habits.length > 0
      ? Math.max(...habits.map((h) => calculateStreak(h.completedDates)))
      : 0;

  /* ---------------- ACTIONS ---------------- */
  const toggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id !== id
          ? h
          : {
              ...h,
              completedDates: h.completedDates.includes(today)
                ? h.completedDates.filter((d) => d !== today)
                : [...h.completedDates, today],
            }
      )
    );
  };

  const saveNumericHabit = (habit) => {
    const value = numericValues[habit.id];
    if (!value) return;

    setHabits((prev) =>
      prev.map((h) =>
        h.id !== habit.id
          ? h
          : {
              ...h,
              completedDates: [
                ...h.completedDates,
                { date: today, value: Number(value) },
              ],
            }
      )
    );

    setNumericValues((prev) => ({ ...prev, [habit.id]: "" }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(habits);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setHabits(items);
  };

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
        <h1 className="text-3xl font-semibold text-slate-800">Today</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl"
        >
          + Add Habit
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Completed Today" value={completedToday} />
        <SummaryCard label="Total Habits" value={habits.length} />
        <SummaryCard label="Best Streak" value={`${bestStreak} 🔥`} />
      </div>
      {/* DAILY PROGRESS */}
<div className="bg-white border border-slate-200 p-4 rounded-2xl">
  <p className="text-sm text-slate-500 mb-1">
    Daily Progress
  </p>

  <div className="w-full bg-slate-200 h-2 rounded-full">
    <div
      className="bg-indigo-500 h-2 rounded-full transition-all"
      style={{ width: `${completionPercent}%` }}
    />
  </div>

  <p className="text-xs text-slate-500 mt-1">
    {completionPercent}% completed
  </p>
</div>

      {/* TODAY'S HABITS */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl">
        <h2 className="font-medium text-slate-700 mb-3">Today’s Habits</h2>

        {todaysHabits.length === 0 && (
          <p className="text-sm text-slate-500">No habits for today ✨</p>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="habits">
            {(provided) => (
              <ul
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2"
              >
                {todaysHabits.map((habit, index) => {
                  const done = isCompletedToday(habit);

                  return (
                    <Draggable
                      key={habit.id}
                      draggableId={habit.id}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                            done
                              ? "bg-slate-100 text-slate-400"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="flex items-center gap-2"
                          >
                            <span className="cursor-grab text-slate-400">☰</span>
                            <span className="text-lg">{habit.icon}</span>
                            <span className={done ? "line-through" : ""}>
                              {habit.title}
                            </span>
                          </div>

                          {habit.type === "boolean" && (
                            <button
                              onClick={() => toggleHabit(habit.id)}
                              className={`px-3 py-1 rounded-xl text-white ${
                                done
                                  ? "bg-slate-400"
                                  : "bg-emerald-400 hover:bg-emerald-500"
                              }`}
                            >
                              {done ? "Done" : "Check"}
                            </button>
                          )}

                          {habit.type === "numeric" && !done && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={numericValues[habit.id] || ""}
                                onChange={(e) =>
                                  setNumericValues((prev) => ({
                                    ...prev,
                                    [habit.id]: e.target.value,
                                  }))
                                }
                                placeholder={habit.unit}
                                className="w-20 p-1 text-sm border border-slate-300 rounded-lg"
                              />
                              <button
                                onClick={() => saveNumericHabit(habit)}
                                className="px-2 py-1 text-sm rounded-lg bg-indigo-500 text-white"
                              >
                                Save
                              </button>
                            </div>
                          )}
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* JOURNAL */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl">
        <h2 className="font-medium text-slate-700 mb-2">Quick Note</h2>

        <textarea
          rows={3}
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Anything you want to note today?"
        />

        <button
          onClick={saveJournal}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-xl"
        >
          Save
        </button>

        {journal[today] && (
          <p className="text-sm text-slate-500 mt-2">
            <strong>Today:</strong> {journal[today]}
          </p>
        )}
      </div>

      {/* ADD HABIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 space-y-4 border border-slate-200">
            <h2 className="text-lg font-semibold">Add New Habit</h2>

            <input
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder="Habit title"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
            />

            <div className="flex gap-2">
              {["✨", "💧", "🏃‍♀️", "📖", "🧘‍♀️", "📝"].map((icon) => (
                <button
                  key={icon}
                  onClick={() => setHabitIcon(icon)}
                  className={`text-xl p-2 rounded-xl ${
                    habitIcon === icon ? "bg-indigo-100" : "bg-slate-100"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={addHabit}
                className="bg-indigo-500 text-white px-4 py-1 rounded-xl"
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

/* ---------------- SMALL COMPONENT ---------------- */
function SummaryCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-indigo-600">{value}</p>
    </div>
  );
}
