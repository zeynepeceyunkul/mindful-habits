import RemindersComponent from "../components/Reminders";

export default function Reminders() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Daily Reminders
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Set up notifications to never forget your habits
        </p>
      </div>

      <RemindersComponent />
    </div>
  );
}

