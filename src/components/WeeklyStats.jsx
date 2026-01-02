import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getLast7DaysStats } from "../utils/stats";

export default function WeeklyStats({ habits }) {
  const data = getLast7DaysStats(habits);

  return (
    <div className="bg-white border border-gray-200 p-5 rounded-xl mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Last 7 Days Progress
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fill: "#6b7280" }} />
          <YAxis allowDecimals={false} tick={{ fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          />
          <Bar
            dataKey="completed"
            fill="#818cf8"   // soft indigo
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
