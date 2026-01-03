import { useState } from "react";

export default function HabitItem({
  habit,
  done,
  innerRef,
  draggableProps,
  dragHandleProps,
  numericValue,
  setNumericValue,
  toggleHabit,
  saveNumericHabit,

  // ❗️ YENİ
  setDeleteModalHabit,

  todayValue,
  progressPercent,
}) {
  const [shake, setShake] = useState(false);

  return (
    <li
      ref={innerRef}
      {...draggableProps}
      className={`flex justify-between items-center px-3 py-2 rounded-xl border transition-all duration-300
        ${shake ? "animate-shake" : ""}
        ${
          done
            ? "bg-slate-100 text-slate-400 scale-[0.98]"
            : "bg-slate-50 hover:scale-[1.01]"
        }`}
    >
      <div {...dragHandleProps} className="flex items-center gap-2">
        <span className="cursor-grab text-slate-400">☰</span>
        <span>{habit.icon}</span>
        <span className={done ? "line-through" : ""}>
          {habit.title}
        </span>
      </div>

      <div className="flex items-center gap-2">
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
          <>
            <input
              type="number"
              value={numericValue}
              onChange={(e) => setNumericValue(e.target.value)}
              className="w-20 p-1 border rounded-lg text-sm"
              placeholder={habit.unit}
            />
            <button
              onClick={() => saveNumericHabit(habit)}
              className="px-2 py-1 text-sm bg-indigo-500 text-white rounded-lg"
            >
              Save
            </button>
          </>
        )}

        <div className="w-28">
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-2 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 text-right">
            {todayValue} / {habit.target} {habit.unit}
          </p>
        </div>

        {/* DELETE – ARTIK SADECE MODAL AÇIYOR */}
       <button
  onClick={() => {
    setShake(true);

    setTimeout(() => {
      setShake(false);
      setDeleteModalHabit(habit); // 🔥 SADECE BU
    }, 300);
  }}
  className="text-red-500 hover:bg-red-100 px-2 rounded-lg"
>
  🗑️
</button>

      </div>
    </li>
  );
}
