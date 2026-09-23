import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { STATIC_DASHBOARD_DATA, itemVariants } from "../utils/dashboard.constants";

export const ServiceDistribution = () => {
  return (
    <motion.div
      variants={itemVariants}
      className="p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between"
    >
      <div>
        <h3 className="text-lg font-bold text-foreground">Popular Services</h3>
        <p className="text-sm text-muted-foreground">Most popular services by booking share.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] py-4">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={STATIC_DASHBOARD_DATA.serviceDistribution}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
            >
              {STATIC_DASHBOARD_DATA.serviceDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                borderRadius: "12px",
                border: "1px solid var(--border)",
              }}
              itemStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              formatter={(value: any) => [`${value}%`, "Share"]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="w-full grid grid-cols-2 gap-3 mt-4 text-xs font-semibold text-muted-foreground">
          {STATIC_DASHBOARD_DATA.serviceDistribution.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="truncate text-foreground/80">{entry.name}</span>
              <span className="ml-auto font-bold text-foreground">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
