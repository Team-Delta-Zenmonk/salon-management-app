import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Scissors, CircleAlert, CircleCheck, Loader2, Users, CreditCard, Bell, CalendarClock, MoreHorizontal, ArrowUpRight, Percent, TrendingUp, Star } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { onboardStripeAction } from "../../features/stripe/onboard-stripe/onboard-stripe.action";
import { getStripeDashboardLinkAction } from "../../features/stripe/get-dashboard-link/get-dashboard-link.action";
import { getSalonProfileAction } from "../../features/auth/profile/get-salon-profile/getSalonProfile.action";
import type { RootState } from "../../store/store";

import { Alert } from "../../components/alert";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

// --- CUSTOM TOOLTIPS ---
const CustomTooltip = ({ active, payload, label }: any) => {
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

// --- MOCK API HOOK ---
// This simulates a real API call to fetch dashboard data.
function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData({
      stats: [
        { title: "Total Bookings", value: "156", change: "+12.5%", isPositive: true, icon: CalendarClock },
        { title: "Total Customers", value: "892", change: "+8.2%", isPositive: true, icon: Users },
        { title: "Revenue", value: "₹45,230", change: "+18.1%", isPositive: true, icon: CreditCard },
        { title: "Avg. Ticket Size", value: "₹290", change: "+4.3%", isPositive: true, icon: TrendingUp },
      ],
      chartData: [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 2000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 2390 },
        { name: 'Sun', revenue: 3490 },
      ],
      recentBookings: [
        { id: 1, customer: "Sarah Johnson", service: "Haircut & Styling", time: "10:00 AM", status: "Confirmed", initials: "SJ" },
        { id: 2, customer: "Mike Davis", service: "Beard Trim", time: "11:30 AM", status: "Pending", initials: "MD" },
        { id: 3, customer: "Emily Chen", service: "Hair Coloring", time: "2:00 PM", status: "Confirmed", initials: "EC" },
        { id: 4, customer: "James Wilson", service: "Haircut", time: "3:30 PM", status: "Confirmed", initials: "JW" },
        { id: 5, customer: "Anna Smith", service: "Manicure", time: "4:15 PM", status: "Pending", initials: "AS" },
      ],
      serviceDistribution: [
        { name: 'Haircuts & Styling', value: 45, color: 'var(--primary)' },
        { name: 'Coloring', value: 25, color: '#f59e0b' },
        { name: 'Nails & Manicure', value: 18, color: '#10b981' },
        { name: 'Facials & Makeup', value: 12, color: 'hsl(var(--muted-foreground))' },
      ],
      staffPerformance: [
        { name: 'Jessica Taylor', role: 'Senior Stylist', bookings: 48, rating: "4.9", avatar: "JT" },
        { name: 'David Smith', role: 'Color Expert', bookings: 36, rating: "4.8", avatar: "DS" },
        { name: 'Sophia Loren', role: 'Nail Artist', bookings: 28, rating: "4.7", avatar: "SL" },
        { name: 'Emma Watson', role: 'Aesthetician', bookings: 22, rating: "4.9", avatar: "EW" },
      ]
    });
    setLoading(false);
  }, []);

  return { data, loading };
}

// --- ANIMATIONS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { data, loading } = useDashboardData();

  useEffect(() => {
    if (searchParams.get("stripe_onboarded") === "true" && salon?.uuid) {
      setTimeout(() => {
        setIsVerifying(true);
        dispatch(getSalonProfileAction(salon.uuid)).finally(() => {
          setTimeout(() => setIsVerifying(false), 5000);
        });
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("stripe_onboarded");
        setSearchParams(nextParams, { replace: true });
      }, 0);
    }
  }, [searchParams, dispatch, setSearchParams, salon?.uuid]);

  const handleStripeConnect = async () => {
    try {
      setIsConnecting(true);
      const res = await dispatch(onboardStripeAction()).unwrap();
      if (res?.message?.url) {
        window.location.href = res.message.url;
      }
    } catch (error) {
      console.error("Failed to connect stripe:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleViewDashboard = async () => {
    try {
      const res = await dispatch(getStripeDashboardLinkAction()).unwrap();
      if (res?.message?.url) {
        window.open(res.message.url, "_blank");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col w-full max-w-[1600px] mx-auto pb-10 px-4 md:px-8"
    >
      {/* Dashboard Header & Stripe Live Status */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 shrink-0 gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground/80 text-sm">
            Welcome back, {salon?.name || 'Owner'}! Here's a quick overview of your salon today.
          </p>
        </div>

        <div className="flex-shrink-0">
          {isVerifying ? (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-2xl shadow-sm text-yellow-700 dark:text-yellow-500">
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-yellow-600 dark:text-yellow-500" />
              <div className="text-left">
                <span className="text-xs font-bold">Verifying Payouts Setup</span>
                <p className="text-[10px] text-muted-foreground">This may take a few moments...</p>
              </div>
            </div>
          ) : !salon?.stripe_account_id ? (
            <div className="flex items-center gap-4 p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-red-600 dark:text-red-500">Payouts Setup Required</p>
                  <p className="text-[10px] text-muted-foreground">Salon hidden from search</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs h-8 px-3.5 font-semibold shadow-sm shadow-red-600/20"
                onClick={handleStripeConnect}
                disabled={isConnecting}
              >
                {isConnecting ? "Redirecting..." : "Connect Stripe"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-3 bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-green-600 dark:text-green-500">Payouts Active</p>
                  <p className="text-[10px] text-muted-foreground">Salon visible & live</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-600/20 rounded-xl text-xs h-8 px-3.5 font-semibold"
                onClick={handleViewDashboard}
              >
                Stripe Dashboard
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {loading ? (
        /* --- SKELETON LOADERS --- */
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="relative overflow-hidden p-4 sm:p-5 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 flex flex-col gap-3 shadow-sm">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-10 h-10 bg-background/50 border border-border/50 rounded-xl animate-pulse" />
                  <div className="w-16 h-6 bg-foreground/5 rounded-full animate-pulse" />
                </div>
                <div className="relative z-10 space-y-2">
                  <div className="w-20 h-3.5 bg-foreground/5 rounded-md animate-pulse" />
                  <div className="w-16 h-7 bg-foreground/10 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm flex flex-col">
              <div className="mb-6">
                <div className="w-40 h-6 bg-foreground/10 rounded-md animate-pulse mb-2" />
                <div className="w-60 h-4 bg-foreground/5 rounded-md animate-pulse" />
              </div>
              <div className="w-full flex-1 min-h-[240px] bg-foreground/5 rounded-2xl animate-pulse" />
            </div>
            <div className="p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm flex flex-col">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <div className="w-32 h-6 bg-foreground/10 rounded-md animate-pulse mb-2" />
                  <div className="w-48 h-4 bg-foreground/5 rounded-md animate-pulse" />
                </div>
                <div className="w-8 h-8 bg-foreground/5 rounded-full animate-pulse" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 flex-1">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={`sk-book-${j}`} className="flex items-center justify-between p-3.5 bg-background/30 border border-border/40 rounded-2xl">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-foreground/10 rounded-full shrink-0 animate-pulse" />
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="w-24 h-4 bg-foreground/10 rounded-md animate-pulse" />
                        <div className="w-16 h-3 bg-foreground/5 rounded-md animate-pulse" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                      <div className="w-12 h-4 bg-foreground/10 rounded-md animate-pulse" />
                      <div className="w-16 h-4 bg-foreground/5 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="w-full h-10 mt-4 bg-foreground/5 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Row 2 Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Popular Services Donut Chart Skeleton */}
            <div className="p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-32 h-6 bg-foreground/10 rounded-md animate-pulse mb-2" />
                <div className="w-48 h-4 bg-foreground/5 rounded-md animate-pulse" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] py-4">
                <div className="w-[140px] h-[140px] rounded-full border-[15px] border-foreground/5 animate-pulse flex items-center justify-center" />
                <div className="w-full grid grid-cols-2 gap-3 mt-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-foreground/10 animate-pulse" />
                      <div className="w-16 h-3 bg-foreground/5 rounded-md animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Staff Leaderboard Skeleton */}
            <div className="lg:col-span-2 p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-40 h-6 bg-foreground/10 rounded-md animate-pulse mb-2" />
                <div className="w-60 h-4 bg-foreground/5 rounded-md animate-pulse" />
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 border border-border/20 rounded-2xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-foreground/10 rounded-full animate-pulse shrink-0" />
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="w-24 h-4 bg-foreground/10 rounded-md animate-pulse" />
                        <div className="w-16 h-3 bg-foreground/5 rounded-md animate-pulse" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                      <div className="w-12 h-4 bg-foreground/10 rounded-md animate-pulse" />
                      <div className="w-8 h-3 bg-foreground/5 rounded-md animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between items-center border-t border-border/10 pt-4">
                <div className="w-48 h-4 bg-foreground/5 rounded-md animate-pulse" />
                <div className="w-32 h-4 bg-foreground/10 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- LOADED DASHBOARD --- */
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {data?.stats.map((stat: any) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={stat.title} 
                  variants={itemVariants}
                  className="group relative overflow-hidden p-4 sm:p-5 bg-card/60 backdrop-blur-md text-card-foreground flex flex-col gap-3 rounded-3xl border border-border/50 shadow-sm transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="w-10 h-10 bg-background/50 rounded-xl flex items-center justify-center border border-border/50 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${stat.isPositive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {stat.isPositive && <ArrowUpRight className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <p className="font-semibold text-xs text-muted-foreground/80 mb-0.5">{stat.title}</p>
                    <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Chart Section */}
            <motion.div variants={itemVariants} className="xl:col-span-2 p-6 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm flex flex-col min-w-0">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Revenue Overview</h3>
                  <p className="text-sm text-muted-foreground">Your earnings over the last 7 days.</p>
                </div>
              </div>
              <div className="w-full flex-1 min-h-[240px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={data?.chartData} 
                    margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="var(--primary)" floodOpacity="0.25"/>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" opacity={0.35} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(value) => `₹${value}`} 
                      width={50}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ stroke: 'var(--primary)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--primary)" 
                      strokeWidth={3}
                      filter="url(#glow)"
                      fillOpacity={1} 
                      fill="url(#revenueGradient)" 
                      activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2, fill: 'var(--primary)' }}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        const todayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
                        const isToday = payload?.name === todayName;
                        if (isToday) {
                          return (
                            <g key={`today-dot-group`}>
                              <circle
                                cx={cx}
                                cy={cy}
                                r={10}
                                fill="var(--primary)"
                                opacity={0.15}
                                className="animate-ping"
                              />
                              <circle
                                cx={cx}
                                cy={cy}
                                r={5}
                                fill="var(--primary)"
                                stroke="hsl(var(--background))"
                                strokeWidth={2}
                              />
                            </g>
                          );
                        }
                        return <></>;
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Recent Bookings */}
            <motion.div variants={itemVariants} className="p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm flex flex-col">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Today's Bookings</h3>
                  <p className="text-sm text-muted-foreground">You have {data?.recentBookings.length} appointments.</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 flex-1 overflow-y-auto pr-2 -mr-2 hide-scrollbar">
                <style dangerouslySetInnerHTML={{
                  __html: `
                  .hide-scrollbar::-webkit-scrollbar { display: none; }
                  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />

                {data?.recentBookings.map((booking: any) => (
                  <div key={booking.id} className="group flex items-center justify-between p-3.5 bg-background/30 border border-border/40 rounded-2xl hover:border-primary/30 hover:bg-background/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar className="h-10 w-10 border border-primary/10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {booking.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{booking.customer}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate">{booking.service}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                      <p className="font-bold text-sm text-foreground">{booking.time}</p>
                      <span
                        className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-full border ${
                          booking.status === "Confirmed" 
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4 rounded-full border-border/60 hover:bg-background/80">
                View All Bookings
              </Button>
            </motion.div>
          </div>

          {/* Row 2: Popular Services Donut Chart & Staff Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Popular Services Donut Chart */}
            <motion.div variants={itemVariants} className="p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Popular Services</h3>
                <p className="text-sm text-muted-foreground">Most popular services by booking share.</p>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] py-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={data?.serviceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data?.serviceDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                      formatter={(value: any) => [`${value}%`, 'Share']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legend */}
                <div className="w-full grid grid-cols-2 gap-3 mt-4 text-xs font-semibold text-muted-foreground">
                  {data?.serviceDistribution.map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="truncate text-foreground/80">{entry.name}</span>
                      <span className="ml-auto font-bold text-foreground">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Staff Performance Leaderboard */}
            <motion.div variants={itemVariants} className="lg:col-span-2 p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Top Performing Staff</h3>
                <p className="text-sm text-muted-foreground">Highest rated and most booked staff this week.</p>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {data?.staffPerformance.map((staff: any) => (
                  <div key={staff.name} className="flex items-center justify-between p-4 bg-background/40 border border-border/40 rounded-2xl hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-primary/10 shrink-0">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {staff.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{staff.name}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate">{staff.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                      <span className="text-xs font-bold text-foreground">{staff.bookings} Bookings</span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-yellow-600">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500 animate-pulse" />
                        <span>{staff.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted-foreground font-medium border-t border-border/20 pt-4">
                <p>Overall customer satisfaction: <span className="text-green-600 font-bold">98.4%</span></p>
                <Button variant="ghost" className="h-auto p-0 text-xs font-bold text-primary hover:bg-transparent">
                  Manage Staff Performance &rarr;
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
