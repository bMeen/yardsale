import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { formatAmount } from "@/lib/utils";

const REVENUE_COLORS = ["#6366f1", "#10b981", "#f59e0b"];

function RevenueChart() {
  const { data } = useDashboardStats();

  if (!data) return null;

  const { revenue } = data;

  const chartData = [
    {
      name: "Listing Fees",
      amount: revenue.listing_fee,
    },
    {
      name: "Settlement Fees",
      amount: revenue.settlement_fee,
    },
    {
      name: "System Auction",
      amount: revenue.system_auction_proceeds,
    },
  ];

  const hasRevenue = chartData.some((item) => item.amount > 0);

  return (
    <div className="bg-card space-y-2 rounded-2xl p-6 lg:col-span-3">
      <div>
        <h2 className="text-base font-semibold">Revenue Breakdown</h2>
      </div>

      {!hasRevenue ? (
        <div className="text-muted-foreground flex h-64 items-center justify-center rounded-xl border border-dashed text-sm">
          No revenue data available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <section className="min-w-0">
            <h3 className="mb-4 text-sm font-medium">Revenue by Source</h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 8,
                    right: 8,
                    left: 8,
                    bottom: 8,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    interval={0}
                    tickFormatter={(value: string) =>
                      value === "Auction Proceeds"
                        ? "Auction"
                        : value.replace(" Fees", "")
                    }
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value: number) => formatAmount(value)}
                    width={48}
                  />

                  <Tooltip
                    formatter={(value) => formatAmount(Number(value ?? 0))}
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      fontSize: 12,
                    }}
                  />

                  <Bar
                    dataKey="amount"
                    name="Revenue"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="min-w-0">
            <h3 className="mb-4 text-sm font-medium">Revenue Distribution</h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.filter((item) => item.amount > 0)}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="none"
                    label={({ percent }) =>
                      percent ? `${(percent * 100).toFixed(0)}%` : "Label"
                    }
                    labelLine={false}
                  >
                    {chartData
                      .filter((item) => item.amount > 0)
                      .map((item) => (
                        <Cell
                          key={item.name}
                          fill={
                            REVENUE_COLORS[
                              chartData.findIndex(
                                (entry) => entry.name === item.name,
                              )
                            ]
                          }
                        />
                      ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => formatAmount(Number(value ?? 0))}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      fontSize: 12,
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default RevenueChart;
