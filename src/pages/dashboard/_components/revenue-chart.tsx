import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "../../../components/ui/button";
import { itemVariants } from "../utils/dashboard.constants";
import type { RevenueChartPoint } from "../../../features/booking/get-revenue-analytics/get-revenue-analytics.service";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border/80 p-4 rounded-2xl shadow-xl flex flex-col gap-1.5 min-w-[120px] transition-all">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-base font-extrabold text-foreground">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface RevenueChartProps {
  timeRange: "7d" | "30d";
  revenueChartData: RevenueChartPoint[];
  chartLoading: boolean;
  onTimeRangeChange: (range: "7d" | "30d") => void;
}

export const RevenueChart = ({
  timeRange,
  revenueChartData,
  chartLoading,
  onTimeRangeChange,
}: RevenueChartProps) => {
  return (
    <motion.div
      variants={itemVariants}
      className="xl:col-span-2 p-6 bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm flex flex-col min-w-0"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">
            Your actual earnings over the last {timeRange === "7d" ? "7 days" : "30 days"}.
          </p>
        </div>
        <div className="flex items-center p-1 rounded-xl bg-background/50 border border-border/50 shadow-sm gap-1 self-start sm:self-auto">
          <Button
            variant={timeRange === "7d" ? "secondary" : "ghost"}
            size="xs"
            onClick={() => onTimeRangeChange("7d")}
            className={`h-7 px-3 rounded-lg font-bold text-xs transition-all ${
              timeRange === "7d"
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === "30d" ? "secondary" : "ghost"}
            size="xs"
            onClick={() => onTimeRangeChange("30d")}
            className={`h-7 px-3 rounded-lg font-bold text-xs transition-all ${
              timeRange === "30d"
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            30 Days
          </Button>
        </div>
      </div>
      <div className="w-full flex-1 min-h-[240px] relative">
        {chartLoading ? (
          <div className="w-full h-[240px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="var(--primary)" floodOpacity="0.25" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.35} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
                dy={10}
                interval={timeRange === "30d" ? 3 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
                tickFormatter={(value) => `₹${value}`}
                width={50}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "var(--primary)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={3}
                filter="url(#glow)"
                fillOpacity={1}
                fill="url(#revenueGradient)"
                activeDot={{ r: 6, stroke: "var(--background)", strokeWidth: 2, fill: "var(--primary)" }}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const todayLabel =
                    timeRange === "7d"
                      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()]
                      : new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" });
                  const isToday = payload?.name === todayLabel;
                  if (isToday) {
                    return (
                      <g key={`today-dot-group`}>
                        <circle cx={cx} cy={cy} r={10} fill="var(--primary)" opacity={0.15} className="animate-ping" />
                        <circle cx={cx} cy={cy} r={5} fill="var(--primary)" stroke="var(--background)" strokeWidth={2} />
                      </g>
                    );
                  }
                  return <></>;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};
