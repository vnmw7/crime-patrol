import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { useMemo } from "react";

export default function DashboardOverview() {
  const primaryStats = useMemo(
    () => [
      {
        title: "Total Incidents",
        value: 1234,
        change: 5,
        changeType: "positive",
      },
      { title: "Active Cases", value: 56, change: -2, changeType: "negative" },
      {
        title: "Reports Filed",
        value: 789,
        change: 10,
        changeType: "positive",
      },
      { title: "Stations Nearby", value: 3, change: 0, changeType: "neutral" },
    ],
    []
  );

  const secondaryStats = [
    { title: "Total Arrests", value: 217 },
    { title: "Unresolved Reports", value: 120 },
    { title: "Community Tips", value: 89 },
    { title: "Patrols Today", value: 42 },
  ];

  const lawEnforcementStats = [
    { name: "Emergency Calls", value: 642 },
    { name: "Avg. Response Time", value: 11 },
    { name: "Cases Closed", value: 48 },
    { name: "Officers Deployed", value: 27 },
    { name: "Patrol Routes", value: 15 },
  ];

  const crimeTrendStats = [
    { name: "Theft", value: 88 },
    { name: "Vandalism", value: 24 },
    { name: "Domestic Violence", value: 12 },
    { name: "Curfew Violations", value: 9 },
    { name: "Noise Complaints", value: 31 },
  ];
  const chartDataPrimary = useMemo(() => {
    return primaryStats.map((stat) => ({
      name: stat.title,
      value: stat.value,
      change: stat.change,
      changeType: stat.changeType,
    }));
  }, [primaryStats]);

  const pieColors = ["#4ade80", "#f87171", "#60a5fa", "#facc15"];
  const lawColors = ["#60a5fa", "#4ade80", "#facc15", "#f87171", "#a78bfa"];
  const crimeColors = ["#f87171", "#fb923c", "#fcd34d", "#86efac", "#93c5fd"];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Overview
      </h1>
      {/* Primary Bar Chart */}
      <div className="w-full h-[300px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartDataPrimary}>
            <XAxis
              dataKey="name"
              interval={0}
              height={80}
              tick={({ x, y, payload, index }) => {
                const value = chartDataPrimary[index].value;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={10}
                      textAnchor="middle"
                      fill="#d1d5db"
                      fontSize={12}
                    >
                      {payload.value}
                    </text>
                    <text
                      x={0}
                      y={30}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={14}
                      fontWeight="bold"
                    >
                      {value}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis />
            <Bar dataKey="value">
              {chartDataPrimary.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.changeType === "positive"
                      ? "#4ade80"
                      : entry.changeType === "negative"
                      ? "#f87171"
                      : "#a1a1aa"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Patrol & Arrest Overview */}
      <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Patrol & Arrest Overview
        </h2>
        <div className="flex flex-col lg:flex-row items-center justify-start gap-x-4">
          <div className="flex flex-col gap-2">
            {secondaryStats.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{
                    backgroundColor: pieColors[index % pieColors.length],
                  }}
                ></span>
                <span className="text-gray-700 dark:text-gray-300">
                  {entry.title}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-[75%] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={secondaryStats}
                  dataKey="value"
                  nameKey="title"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#1f2937"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {secondaryStats[index].value}
                      </text>
                    );
                  }}
                >
                  {secondaryStats.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>{" "}
      {/* Crime Trends - Line Chart */}
      <div className="w-full h-[350px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Crime Trends
        </h2>
        <div className="flex flex-col lg:flex-row items-start gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {crimeTrendStats.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{
                    backgroundColor: crimeColors[index % crimeColors.length],
                  }}
                ></span>
                <span className="text-gray-700 dark:text-gray-300">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={crimeTrendStats}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" />
            <XAxis
              dataKey="name"
              angle={-15}
              textAnchor="end"
              interval={0}
              tick={{ fill: "#d1d5db", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "#d1d5db", fontSize: 12 }}
              domain={[0, "auto"]}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                color: "#fff",
              }}
            />{" "}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={({ cx, cy, index }) => (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={crimeColors[index % crimeColors.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}
              activeDot={false}
              isAnimationActive={false}
            />
            <LabelList
              dataKey="value"
              position="bottom"
              offset={12}
              fill="#1f2937"
              fontSize={12}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Law Enforcement & Response */}
      <div className="w-full h-[320px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Law Enforcement & Response
        </h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={lawEnforcementStats}
            margin={{ top: 10, right: 20, left: 80, bottom: 20 }}
          >
            <XAxis
              type="number"
              tickCount={6}
              allowDecimals={false}
              tick={{ fill: "#d1d5db", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fill: "#e5e7eb", fontSize: 12 }}
            />
            <Bar
              dataKey="value"
              barSize={20}
              isAnimationActive={false}
              activeBar={false}
            >
              <LabelList
                dataKey="value"
                position="insideRight"
                fill="#1f2937"
                fontSize={12}
              />
              {lawEnforcementStats.map((entry, index) => (
                <Cell key={index} fill={lawColors[index % lawColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Placeholder for recent incidents feed or a mini-map...
        </p>
      </div>
    </div>
  );
}
