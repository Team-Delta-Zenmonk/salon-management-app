import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from "../../../../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  Phone, Mail, MapPin, Cake,
  Calendar, Shield, UserCircle, Clock
} from "lucide-react";
import type { Staff } from "../../../../features/staff/staff.slice";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { motion, AnimatePresence } from "framer-motion";

dayjs.extend(customParseFormat);

const formatDisplayDate = (date: string | undefined | null) => {
  if (!date) return "—";
  const parsed = dayjs(date, "DD-MM-YYYY", true);
  if (parsed.isValid()) return parsed.format("DD MMM YYYY");
  const fallback = dayjs(date);
  if (fallback.isValid()) return fallback.format("DD MMM YYYY");
  return date;
};

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_ABBR: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

interface StaffDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  staff: Staff | null;

}

// ─── Reusable info row ────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor?: string;
  iconBg?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3.5">
      <div className={`w-9 h-9 flex items-center justify-center rounded-xl shrink-0 ${iconBg} ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5 leading-none">{label}</p>
        <p className="text-sm font-semibold text-foreground break-all leading-snug">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex p-3.5 bg-muted/30 border border-border/40 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 no-underline group"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="flex p-3.5 bg-muted/30 border border-border/40 rounded-2xl">
      {inner}
    </div>
  );
}

const TABS = [
  { value: "contact", label: "Contact" },
  { value: "employment", label: "Employment" },
  { value: "schedule", label: "Schedule" },
];

export default function StaffDetailsDialog({
  open,
  onClose,
  staff,
}: Readonly<StaffDetailsDialogProps>) {
  const [tab, setTab] = useState("contact");

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTab("contact");
    }
  }

  if (!staff) return null;

  const fullName = `${staff.first_name} ${staff.last_name || ""}`.trim();
  const initials = staff.first_name?.charAt(0).toUpperCase() || "S";
  const isActive = !staff.end_date || dayjs(staff.end_date, "DD-MM-YYYY").isAfter(dayjs());
  const todayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayjs().day()];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px] w-full max-h-[90vh] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-3xl flex flex-col">

        {/* ── Header ── */}
        <div className="shrink-0 px-6 py-5 border-b border-border/40 bg-muted/20">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="w-14 h-14 rounded-2xl ring-2 ring-primary/10 shadow-md overflow-hidden shrink-0">
              <AvatarImage src={staff.photos?.url} alt={fullName} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-foreground capitalize leading-tight tracking-tight truncate">
                  {fullName}
                </h2>
                {isActive ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 rounded-full px-2 py-0 text-[10px] font-bold gap-1 select-none h-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-2 py-0 text-[10px] font-bold gap-1 select-none h-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                    Inactive
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1.5">
                <UserCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                <span className="capitalize">{staff.title || 'Staff Member'}</span>
                <span className="text-border mx-0.5">•</span>
                <Calendar className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                <span>Joined {formatDisplayDate(staff.joining_date)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Custom Tab Bar ── */}
        <div className="shrink-0 flex items-stretch border-b border-border/40 bg-muted/10 px-2">
          {TABS.map((t) => {
            const isActive = tab === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`relative flex-1 py-3 text-xs font-semibold tracking-wide transition-all duration-200 focus:outline-none ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {/* Active underline */}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                    isActive ? "w-4/5 opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="p-6 flex flex-col gap-3"
            >
              {/* ── Contact ── */}
              {tab === "contact" && (
                <>
                  <InfoRow
                    icon={Phone}
                    label="Primary Phone"
                    value={staff.phone_number}
                    href={`tel:${staff.phone_number}`}
                  />
                  {staff.additional_phone_number && (
                    <InfoRow
                      icon={Phone}
                      label="Additional Phone"
                      value={staff.additional_phone_number}
                      href={`tel:${staff.additional_phone_number}`}
                    />
                  )}
                  <InfoRow
                    icon={Mail}
                    label="Email Address"
                    value={staff.email || "No email on file"}
                    href={staff.email ? `mailto:${staff.email}` : undefined}
                    iconColor={staff.email ? "text-primary" : "text-muted-foreground/50"}
                    iconBg={staff.email ? "bg-primary/10" : "bg-muted/30"}
                  />
                  {staff.address && (
                    <InfoRow
                      icon={MapPin}
                      label="Address"
                      value={staff.address}
                      iconColor="text-amber-600"
                      iconBg="bg-amber-500/10"
                    />
                  )}
                </>
              )}

              {/* ── Employment ── */}
              {tab === "employment" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow
                      icon={Calendar}
                      label="Joining Date"
                      value={formatDisplayDate(staff.joining_date)}
                    />
                    <InfoRow
                      icon={Cake}
                      label="Date of Birth"
                      value={formatDisplayDate(staff.dob)}
                      iconColor="text-violet-500"
                      iconBg="bg-violet-500/10"
                    />
                  </div>

                  {staff.end_date && (
                    <InfoRow
                      icon={Calendar}
                      label="End Date"
                      value={formatDisplayDate(staff.end_date)}
                      iconColor="text-destructive"
                      iconBg="bg-destructive/10"
                    />
                  )}

                  {staff.emergency_contact && (
                    <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5 flex flex-col gap-2.5 mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
                          <Shield className="h-4 w-4" />
                        </div>
                        <p className="text-[10px] text-destructive/70 uppercase tracking-widest font-bold">Emergency Contact</p>
                      </div>
                      <p className="text-sm font-bold text-foreground pl-10">{staff.emergency_contact.name || '—'}</p>
                      {staff.emergency_contact.phone && (
                        <a
                          href={`tel:${staff.emergency_contact.phone}`}
                          className="pl-10 flex items-center gap-2 text-xs font-semibold text-destructive/70 hover:text-destructive transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {staff.emergency_contact.phone}
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ── Schedule ── */}
              {tab === "schedule" && (
                <>
                  {/* Today's summary card */}
                  {(() => {
                    const todayHours = staff.active_hours?.[todayKey];
                    const hasHours = todayHours?.start_time && todayHours?.end_time;
                    return (
                      <div className={`flex items-center gap-3 p-4 rounded-2xl border mb-1 ${
                        hasHours
                          ? "bg-primary/8 border-primary/20"
                          : "bg-muted/20 border-border/30"
                      }`}>
                        <div className={`w-9 h-9 flex items-center justify-center rounded-xl shrink-0 ${
                          hasHours ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground/50"
                        }`}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Today's Shift</p>
                          <p className={`text-sm font-bold ${hasHours ? "text-primary" : "text-muted-foreground"}`}>
                            {hasHours ? `${todayHours.start_time} – ${todayHours.end_time}` : "Off Today"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Weekly grid — 7 day cards */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const hours = staff.active_hours?.[day];
                      const isClosed = !hours?.start_time || !hours?.end_time;
                      const isToday = day === todayKey;

                      return (
                        <div
                          key={day}
                          className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border transition-all duration-200 ${
                            isToday
                              ? "bg-primary border-primary shadow-md shadow-primary/20"
                              : isClosed
                              ? "bg-muted/30 border-border/40"
                              : "bg-muted/30 border-border/30"
                          }`}
                        >
                          {/* Day abbreviation */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            isToday ? "text-primary-foreground" : isClosed ? "text-muted-foreground" : "text-foreground/80"
                          }`}>
                            {DAY_ABBR[day]}
                          </span>

                          {/* Hours or off */}
                          {isClosed ? (
                            <span className={`text-[9px] font-semibold ${isToday ? "text-primary-foreground/80" : "text-destructive"}`}>
                              Off
                            </span>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`text-[9px] font-semibold leading-none ${isToday ? "text-primary-foreground" : "text-foreground/80"}`}>
                                {hours.start_time}
                              </span>
                              <span className={`text-[8px] ${isToday ? "text-primary-foreground/60" : "text-muted-foreground"}`}>to</span>
                              <span className={`text-[9px] font-semibold leading-none ${isToday ? "text-primary-foreground" : "text-foreground/80"}`}>
                                {hours.end_time}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 py-4 border-t border-border/40 bg-muted/10 flex items-center justify-end">
          <Button
            size="sm"
            onClick={onClose}
            className="rounded-full px-5 h-9 text-xs font-semibold shadow-sm"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
