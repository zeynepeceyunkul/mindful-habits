import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getDailyQuote } from "../utils/dailyQuote";
import { todayString } from "../utils/date";
import { calculateStreak } from "../utils/streak";
import HabitItem from "../components/HabitItem";

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
const [deleteModalHabit, setDeleteModalHabit] = useState(null);
const [lastDeletedHabit, setLastDeletedHabit] = useState(null);

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
  const getTodayNumericValue = (habit) => {
  const entry = habit.completedDates.find(
    (c) => typeof c === "object" && c.date === today
  );
  return entry ? entry.value : 0;
};

  const isCompletedToday = (habit) => {
  if (habit.type === "boolean") {
    return habit.completedDates.includes(today);
  }

  if (habit.type === "numeric") {
    const entry = habit.completedDates.find(
      (c) => typeof c === "object" && c.date === today
    );

    return entry && habit.target
      ? entry.value >= habit.target
      : false;
  }

  return false;
};


  /* ---------------- DERIVED DATA ---------------- */
  const todaysHabits = habits.filter(
  (h) =>
    (h.paused ?? false) === false &&
    h.startDate.split("T")[0] <= today
);


  // DONE OLANLARI ALTA TAŞI
const sortedHabits = [
  ...todaysHabits.filter((h) => !isCompletedToday(h)),
  ...todaysHabits.filter((h) => isCompletedToday(h)),
];

  const completedToday = habits.filter(
  (h) => !h.paused && isCompletedToday(h)
).length;

const activeHabits = habits.filter((h) => !h.paused);

const completionPercent = activeHabits.length
  ? Math.round(
      (completedToday / activeHabits.length) * 100
    )
  : 0;


  const bestStreak =
    habits.length > 0
      ? Math.max(...habits.map((h) => calculateStreak(h.completedDates)))
      : 0;

  /* ---------------- ACTIONS ---------------- */
  // eslint-disable-next-line no-unused-vars
 const deleteHabit = (habit) => {
  setHabits((prev) => prev.filter((h) => h.id !== habit.id));
  setLastDeletedHabit(habit);

  // 5 saniye sonra undo iptal
  setTimeout(() => {
    setLastDeletedHabit(null);
  }, 5000);
};


  const toggleHabit = (id) => {
  setHabits((prev) =>
    prev.map((h) => {
      if (h.id !== id) return h;
      if (h.paused) return h; // ⏸ pause koruması

      return {
        ...h,
        completedDates: h.completedDates.includes(today)
          ? h.completedDates.filter((d) => d !== today)
          : [...h.completedDates, today],
      };
    })
  );
};




  const saveNumericHabit = (habit) => {
  const value = Number(numericValues[habit.id]);
  if (!value) return;

  setHabits((prev) =>
    prev.map((h) => {
      if (h.id !== habit.id) return h;

      const filtered = h.completedDates.filter(
        (c) => typeof c === "string" || c.date !== today
      );

      return {
        ...h,
        completedDates: [...filtered, { date: today, value }],
      };
    })
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
      paused: false,
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
                {sortedHabits.map((habit, index) => {

                  const done = isCompletedToday(habit);

                  return (
                    <Draggable
  key={habit.id}
  draggableId={habit.id}
  index={index}
>
  {(provided) => (
    <HabitItem
  habit={habit}
  done={done}
  innerRef={provided.innerRef}
  draggableProps={provided.draggableProps}
  dragHandleProps={provided.dragHandleProps}
  numericValue={numericValues[habit.id] || ""}
  setNumericValue={(val) =>
    setNumericValues((prev) => ({
      ...prev,
      [habit.id]: val,
    }))
  }
  toggleHabit={toggleHabit}
  saveNumericHabit={saveNumericHabit}
  setDeleteModalHabit={setDeleteModalHabit}
  // ✅ BU SATIR ŞART
  todayValue={getTodayNumericValue(habit)}
  progressPercent={
    habit.type === "numeric" && habit.target
      ? Math.min(
          100,
          Math.round(
            (getTodayNumericValue(habit) / habit.target) * 100
          )
        )
      : 0
  }
/>

    
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
            {/* HABIT TYPE */}
<div className="flex gap-2">
  <button
    onClick={() => setHabitType("boolean")}
    className={`flex-1 py-2 rounded-xl border ${
      habitType === "boolean"
        ? "bg-indigo-500 text-white"
        : "bg-slate-100"
    }`}
  >
    Boolean
  </button>

  <button
    onClick={() => setHabitType("numeric")}
    className={`flex-1 py-2 rounded-xl border ${
      habitType === "numeric"
        ? "bg-indigo-500 text-white"
        : "bg-slate-100"
    }`}
  >
    Numeric
  </button>
</div>
{/* NUMERIC SETTINGS */}
{habitType === "numeric" && (
  <div className="flex gap-2">
    <input
      type="number"
      value={habitTarget}
      onChange={(e) => setHabitTarget(e.target.value)}
      placeholder="Target"
      className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-xl"
    />

    <input
      value={habitUnit}
      onChange={(e) => setHabitUnit(e.target.value)}
      placeholder="Unit (e.g. dk)"
      className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-xl"
    />
  </div>
)}


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
      {deleteModalHabit && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-80 space-y-4 animate-scaleIn">
      <h3 className="text-lg font-semibold">Delete Habit</h3>

      <p className="text-sm text-slate-600">
        Are you sure you want to delete
        <strong className="ml-1">{deleteModalHabit.title}</strong>?
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setDeleteModalHabit(null)}
          className="px-3 py-1 rounded-xl"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            deleteHabit(deleteModalHabit);
            setDeleteModalHabit(null);
          }}
          className="bg-red-500 text-white px-4 py-1 rounded-xl"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
  
)}
{lastDeletedHabit && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-4 shadow-lg">
    <span>
      "{lastDeletedHabit.title}" deleted
    </span>

    <button
      onClick={() => {
        setHabits((prev) => [...prev, lastDeletedHabit]);
        setLastDeletedHabit(null);
      }}
      className="underline text-indigo-300 hover:text-indigo-200"
    >
      Undo
    </button>
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
