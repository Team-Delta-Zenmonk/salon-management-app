import { Box } from "@mui/material";

export function MiniChart({
  data1,
  data2,
  labels,
  color1 = "#8b5cf6",
  color2 = "#10b981",
}: {
  data1: number[];
  data2: number[];
  labels: string[];
  color1?: string;
  color2?: string;
}) {
  const max1 = Math.max(...data1, 0);
  const getNiceMax = (max: number) => {
    if (max === 0) return 140;
    const power = Math.pow(10, Math.floor(Math.log10(max || 1)));
    const fraction = max / power;
    let niceFraction = 1;
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 4) niceFraction = 4;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
    return niceFraction * power;
  };
  const niceMax = getNiceMax(max1);
  const max2 = Math.max(...data2, 1);

  const w = 400;
  const h = 140;
  const padY = 20;
  const padX = 45;
  const rightPad = 20;

  const ySteps = [0, 0.25, 0.5, 0.75, 1];

  const points1 = data1.map((v, i) => {
    const x = padX + (i / (data1.length - 1)) * (w - padX - rightPad);
    const y = h - padY - ((v / niceMax) * (h - padY * 2));
    return `${x},${y}`;
  }).join(" ");

  const points2 = data2.map((v, i) => {
    const x = padX + (i / (data2.length - 1)) * (w - padX - rightPad);
    const y = h - padY - ((v / max2) * (h - padY * 2));
    return `${x},${y}`;
  }).join(" ");

  return (
    <Box className="w-full mt-6">
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Horizontal Grid lines & Y-axis labels */}
        {ySteps.map((pct) => {
          const y = h - padY - pct * (h - padY * 2);
          const val = niceMax * pct;
          return (
            <g key={`h-${pct}`}>
              <line x1={padX} y1={y} x2={w - rightPad} y2={y} stroke="var(--border-subtle)" strokeWidth="1" />
              <text x={padX - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--text-muted)" fontFamily="inherit">
                ₹{val >= 1000 ? (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : val}
              </text>
            </g>
          );
        })}

        {/* Vertical Grid lines & X-axis labels */}
        {labels.map((label, i) => {
          const x = padX + (i / (labels.length - 1)) * (w - padX - rightPad);
          // Show all labels for 7 days, skip alternate for 30 days
          const shouldShow = labels.length <= 8 || i % Math.ceil(labels.length / 7) === 0 || i === labels.length - 1;
          return (
            <g key={`v-${i}`}>
              <line x1={x} y1={padY} x2={x} y2={h - padY} stroke="var(--border-subtle)" strokeWidth="1" />
              {shouldShow && (
                <text x={x} y={h - padY + 16} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="inherit">
                  {label}
                </text>
              )}
            </g>
          );
        })}

        {/* Line for Data 1 (Sales) */}
        <polyline points={points1} fill="none" stroke={color1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Line for Data 2 (Appointments) */}
        <polyline points={points2} fill="none" stroke={color2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots for Data 1 */}
        {data1.map((v, i) => {
          const x = padX + (i / (data1.length - 1)) * (w - padX - rightPad);
          const y = h - padY - ((v / niceMax) * (h - padY * 2));
          return <circle key={`d1-${i}`} cx={x} cy={y} r="3" fill={color1} />;
        })}
        {/* Dots for Data 2 */}
        {data2.map((v, i) => {
          const x = padX + (i / (data2.length - 1)) * (w - padX - rightPad);
          const y = h - padY - ((v / max2) * (h - padY * 2));
          return <circle key={`d2-${i}`} cx={x} cy={y} r="3" fill={color2} />;
        })}
      </svg>
    </Box>
  );
}
