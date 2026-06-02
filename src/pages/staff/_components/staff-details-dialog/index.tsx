import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Avatar, 
  Divider,
  Chip,
  Tabs,
  Tab,
  IconButton
} from "@mui/material";
import { 
  PhoneOutlined, 
  EmailOutlined, 
  LocationOnOutlined, 
  CakeOutlined,
  EditOutlined,
  DeleteOutlined,
  AssignmentTurnedInOutlined,
  CalendarTodayOutlined
} from "@mui/icons-material";
import clsx from "clsx";
import styles from "./staff-details-dialog.module.scss";
import type { Staff } from "../../../../features/staff/staff.slice";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const formatDisplayDate = (date: string | undefined | null) => {
  if (!date) return "—";
  const parsed = dayjs(date, "DD-MM-YYYY", true);
  if (parsed.isValid()) return parsed.format("DD MMM YYYY");
  const fallback = dayjs(date);
  if (fallback.isValid()) return fallback.format("DD MMM YYYY");
  return date;
};

interface StaffDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  staff: Staff | null;
  onEdit?: (staff: Staff) => void;
  onDelete?: (staff: Staff) => void;
  onAssign?: (staff: Staff) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StaffDetailsDialog({ 
  open, 
  onClose, 
  staff,
  onEdit,
  onDelete,
  onAssign
}: Readonly<StaffDetailsDialogProps>) {
  const [tabValue, setTabValue] = useState(0);

  if (!staff) return null;

  const fullName = `${staff.first_name} ${staff.last_name || ""}`.trim();
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ sx: { borderRadius: 3 } }}
      className={styles.dialogContainer}
    >
      <DialogTitle className={clsx(styles.dialogHeader, "p-5")}>
        <Box className={styles.staffHeader}>
          <Box className={styles.staffInfo}>
            <Avatar src={staff.photos?.url} alt={fullName} sx={{ width: 64, height: 64 }} />
            <Box className={styles.staffDetails}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" className={styles.staffName}>
                  {fullName}
                </Typography>
                <Chip label={staff.gender} size="small" color="primary" className="capitalize text-xs" />
              </Box>
              <Typography variant="body2" className={styles.staffTitle}>
                {staff.title || 'Staff Member'} • Joined {formatDisplayDate(staff.joining_date)}
              </Typography>
            </Box>
          </Box>
          <Box className={styles.actionButtons}>
            {onAssign && (
              <IconButton
                onClick={() => onAssign(staff)}
                className={clsx(styles.actionButton)}
                title="Assign Services"
              >
                <AssignmentTurnedInOutlined fontSize="small" />
              </IconButton>
            )}
            {onEdit && (
              <IconButton
                onClick={() => onEdit(staff)}
                className={clsx(styles.actionButton)}
                title="Edit Staff"
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                onClick={() => onDelete(staff)}
                className={clsx(styles.actionButton, styles.deleteButton)}
                title="Delete Staff"
              >
                <DeleteOutlined fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <Box className={styles.tabsContainer}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="staff details tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--secondary-600)',
              padding: '12px 16px',
              '@media (max-width: 600px)': {
                padding: '12px 8px',
                fontSize: '0.65rem',
              },
              '&.Mui-selected': {
                color: 'var(--primary-900)',
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: 'var(--primary-900)',
              height: 3,
            },
          }}
        >
          <Tab label="Primary Contact" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Personal & Emergency" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="Weekly Schedule" id="tab-2" aria-controls="tabpanel-2" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box className={styles.infoItem}>
              <PhoneOutlined className={styles.infoIcon} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" className={styles.infoLabel}>Primary Phone</Typography>
                <Typography variant="body2" className={styles.infoValue}>{staff.phone_number}</Typography>
              </Box>
            </Box>

            {staff.additional_phone_number && (
              <Box className={styles.infoItem}>
                <PhoneOutlined className={styles.infoIcon} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" className={styles.infoLabel}>Additional Phone</Typography>
                  <Typography variant="body2" className={styles.infoValue}>{staff.additional_phone_number}</Typography>
                </Box>
              </Box>
            )}

            {staff.email && (
              <Box className={styles.infoItem}>
                <EmailOutlined className={styles.infoIcon} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" className={styles.infoLabel}>Email Address</Typography>
                  <Typography variant="body2"  sx={{ wordBreak: 'break-all' }}>{staff.email}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box className={styles.infoItem}>
              <CalendarTodayOutlined className={clsx(styles.infoIcon, styles.calendarIcon)} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" className={styles.infoLabel}>End Date</Typography>
                <Typography variant="body2" className={styles.infoValue}>{formatDisplayDate(staff.end_date)}</Typography>
              </Box>
            </Box>
            <Box className={styles.infoItem}>
              <CakeOutlined className={styles.infoIcon} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" className={styles.infoLabel}>Date of Birth</Typography>
                <Typography variant="body2" className={styles.infoValue}>{formatDisplayDate(staff.dob)}</Typography>
              </Box>
            </Box>

            <Box className={styles.infoItem}>
              <LocationOnOutlined className={styles.infoIcon} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" className={styles.infoLabel}>Location</Typography>
                <Typography variant="body2" className={styles.infoValue}>{staff.address || '—'}</Typography>
              </Box>
            </Box>

            {staff.emergency_contact && (
              <Box className={styles.emergencyBox}>
                <Typography variant="caption" className={styles.emergencyLabel}>Emergency Contact</Typography>
                <Typography variant="body2" className={styles.emergencyName}>{staff.emergency_contact.name || '—'}</Typography>
                <Box className={styles.emergencyContact}>
                  <PhoneOutlined fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{staff.emergency_contact.phone || '—'}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {daysOfWeek.map((day) => {
              const hours = staff.active_hours?.[day];
              const dayLabel = day.charAt(0).toUpperCase() + day.slice(1, 3);
              return (
                <Box 
                  key={day} 
                  className={styles.scheduleItem}
                >
                  <Typography variant="body2" className={styles.dayLabel}>{dayLabel}</Typography>
                  {hours && hours.start_time && hours.end_time ? (
                    <Typography variant="body2" className={styles.scheduleTime}>{hours.start_time} - {hours.end_time}</Typography>
                  ) : (
                    <Typography variant="body2" className={styles.scheduleOff}>Off</Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </TabPanel>
      </DialogContent>


      <Divider />
      <DialogActions className={clsx(styles.dialogFooter, "p-4")}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          disableElevation 
          size="small"
          className={styles.closeButtonFooter}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
