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

export default function Dashboard({ habits, setHabits, toggleHabit: toggleHabitProp, saveNumericHabit: saveNumericHabitProp, deleteHabit: deleteHabitProp, togglePause }) {
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
  const handleDeleteHabit = (habit) => {
    if (deleteHabitProp) {
      deleteHabitProp(habit.id);
    } else if (setHabits) {
      setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    }
    setLastDeletedHabit(habit);

    // 5 saniye sonra undo iptal
    setTimeout(() => {
      setLastDeletedHabit(null);
    }, 5000);
  };

  const handleToggleHabit = (id) => {
    if (toggleHabitProp) {
      toggleHabitProp(id);
    } else {
      // Fallback to local implementation
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== id) return h;
          if (h.paused) return h;

          return {
            ...h,
            completedDates: h.completedDates.includes(today)
              ? h.completedDates.filter((d) => d !== today)
              : [...h.completedDates, today],
          };
        })
      );
    }
  };

  const handleSaveNumericHabit = (habit) => {
    const value = Number(numericValues[habit.id]);
    if (!value) return;

    if (saveNumericHabitProp) {
      saveNumericHabitProp(habit.id, value);
    } else if (setHabits) {
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
    }
    setNumericValues((prev) => ({ ...prev, [habit.id]: "" }));
  };


  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(habits);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    // Use setHabits from props if available, otherwise use local state
    if (setHabits) {
      setHabits(items);
    }
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

    if (setHabits) {
      setHabits((prev) => [...prev, newHabit]);
    }

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
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 p-6 rounded-2xl text-center shadow-sm">
        <div className="text-4xl mb-3">💭</div>
        <p className="italic text-slate-800 text-lg font-medium leading-relaxed">
          "{dailyQuote}"
        </p>
        <p className="text-xs text-slate-500 mt-3">Daily Inspiration</p>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Today
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          + Add Habit
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard 
          label="Completed Today" 
          value={completedToday} 
          icon="✅"
          gradient="from-emerald-50 to-teal-50"
          borderColor="border-emerald-200"
          textColor="text-emerald-600"
        />
        <SummaryCard 
          label="Total Habits" 
          value={habits.length} 
          icon="📋"
          gradient="from-indigo-50 to-blue-50"
          borderColor="border-indigo-200"
          textColor="text-indigo-600"
        />
        <SummaryCard 
          label="Best Streak" 
          value={`${bestStreak}`} 
          icon="🔥"
          gradient="from-orange-50 to-red-50"
          borderColor="border-orange-200"
          textColor="text-orange-600"
        />
      </div>
      {/* DAILY PROGRESS */}
<div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
  <div className="flex items-center justify-between mb-3">
    <p className="text-sm font-medium text-slate-700">
      Daily Progress
    </p>
    <p className="text-sm font-bold text-indigo-600">
      {completionPercent}%
    </p>
  </div>

  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
    <div
      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
      style={{ width: `${completionPercent}%` }}
    />
  </div>

  <p className="text-xs text-slate-500 mt-2">
    {completedToday} of {activeHabits.length} habits completed
  </p>
</div>

      {/* TODAY'S HABITS */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4 text-lg">Today's Habits</h2>

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
  toggleHabit={handleToggleHabit}
  saveNumericHabit={handleSaveNumericHabit}
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
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 text-lg">Quick Note</h2>
          <a 
            href="/journal" 
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View Full Journal →
          </a>
        </div>

        <textarea
          rows={3}
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none"
          placeholder="Anything you want to note today?"
        />

        <button
          onClick={saveJournal}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          Save Note
        </button>

        {journal[today] && (
          <p className="text-sm text-slate-500 mt-2">
            <strong>Today:</strong> {journal[today]}
          </p>
        )}
      </div>

      {/* ADD HABIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Add New Habit</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>

            <input
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder="Habit title"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addHabit}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Add Habit
              </button>
            </div>
          </div>
        </div>
        
      )}
      {deleteModalHabit && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
      <h3 className="text-lg font-bold text-slate-800">Delete Habit</h3>

      <p className="text-sm text-slate-600">
        Are you sure you want to delete{" "}
        <strong className="text-slate-800">{deleteModalHabit.title}</strong>? This action cannot be undone.
      </p>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={() => setDeleteModalHabit(null)}
          className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            handleDeleteHabit(deleteModalHabit);
            setDeleteModalHabit(null);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
  
)}
{lastDeletedHabit && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-4 shadow-2xl z-50 animate-slideUp">
    <span className="font-medium">
      "{lastDeletedHabit.title}" deleted
    </span>

    <button
      onClick={() => {
        if (setHabits) {
          setHabits((prev) => [...prev, lastDeletedHabit]);
        }
        setLastDeletedHabit(null);
      }}
      className="underline text-indigo-300 hover:text-indigo-200 font-medium"
    >
      Undo
    </button>
  </div>
)}

    </div>
    
  );
}

/* ---------------- SMALL COMPONENT ---------------- */
function SummaryCard({ label, value, icon, gradient, borderColor, textColor }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border ${borderColor} p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}
