import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import clsx from "clsx";
import { FormProvider, useForm, useFieldArray, useWatch, type SubmitHandler } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { callSnack } from "../../../../components/snackbar";
import styles from "./booking-dialog.module.scss";
import { useState, useEffect, useMemo, useCallback } from "react";
import { BOOKING_STATUS } from "../../../../common/enums/booking-status.enum";
import { bookingSchema, type BookingFormValues } from "../../schema/booking.schema";
import TextField from "../../../../components/form/textfield";
import Select from "../../../../components/form/select";
import DatePicker from "../../../../components/form/date-picker";
import TimePicker from "../../../../components/form/time-picker";
import { listServiceStaff } from "../../../../features/service/list-staff/list-staff.service";
import { createBookingAction } from "../../../../features/booking/create-booking/create-booking.action";
import { updateBookingAction } from "../../../../features/booking/update-booking/update-booking.action";
import dayjs from "dayjs";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  booking?: any;
}

interface ServiceStaff {
  id: number;
  staff_id: number;
  service_id: number;
  price: number;
  duration: number;
  staff: {
    id: number;
    uuid: string;
    first_name: string;
    last_name?: string;
  };
}

type StaffMap = Record<number, { loading: boolean; data: ServiceStaff[] }>;

const EMPTY_SERVICE = { service_id: undefined as any, staff_id: undefined as any };

const formatPrice = (price: number) => `₹${Math.round(price).toLocaleString("en-IN")}`;

export default function BookingDialog({ open, onClose, mode, booking }: Readonly<BookingDialogProps>) {
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state) => state.auth);
  const { data: services } = useAppSelector((state) => state.service);
  const [isLoading, setIsLoading] = useState(false);
  const [staffMap, setStaffMap] = useState<StaffMap>({});

  const methods = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      services: [{ ...EMPTY_SERVICE }],
      booking_date: new Date(),
      booking_start_time: "",
      status: BOOKING_STATUS.CONFIRMED,
    },
  });

  const { handleSubmit, reset, control } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  const watchedServices = useWatch({ control, name: "services" });

  const allServiceOptions = useMemo(() => services.map((s) => ({ label: s.name, value: String(s.id) })), [services]);

  const getServiceOptionsForRow = useCallback(
    (rowIndex: number) => {
      const selectedIds = new Set(
        (watchedServices ?? [])
          .map((s, i) => (i !== rowIndex && s.service_id ? Number(s.service_id) : null))
          .filter(Boolean)
      );

      return allServiceOptions.filter((opt) => !selectedIds.has(Number(opt.value)));
    },
    [allServiceOptions, watchedServices],
  );

  const fetchStaffForRow = useCallback(
    async (rowIndex: number, serviceId: number) => {
      const service = services.find((s) => s.id === Number(serviceId));
      if (!service || !salon?.uuid) return;

      setStaffMap((prev) => ({ ...prev, [rowIndex]: { loading: true, data: prev[rowIndex]?.data ?? [] } }));

      try {
        const data = await listServiceStaff(service.uuid, salon.uuid);
        setStaffMap((prev) => ({ ...prev, [rowIndex]: { loading: false, data } }));
      } catch (err) {
        console.error("Failed to fetch staff for row", rowIndex, err);
        callSnack("Failed to load staff for service", "error");
        setStaffMap((prev) => ({ ...prev, [rowIndex]: { loading: false, data: [] } }));
      }
    },
    [services, salon?.uuid],
  );

  useEffect(() => {
    if (!watchedServices) return;

    watchedServices.forEach((svc, idx) => {
      if (svc.service_id) {
        const current = staffMap[idx];
        const currentServiceInStaff = current?.data?.[0]?.service_id;
        if (currentServiceInStaff !== Number(svc.service_id)) {
          fetchStaffForRow(idx, svc.service_id);
        }
      }
    });
  }, [watchedServices?.map((s) => s.service_id).join(",")]);

  useEffect(() => {
    if (!open) return;

    setStaffMap({});

    if (mode === "update" && booking) {
      const bookingServices = booking.booking_services?.map((bs: any) => ({
        service_id: bs.service_id,
        staff_id: bs.staff_id,
      })) ?? [{ ...EMPTY_SERVICE }];

      const d = new Date(booking.booking_start_time);
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");

      reset({
        customer_name: booking.admin_booking?.name || "",
        customer_phone: booking.admin_booking?.phone || "",
        services: bookingServices,
        booking_date: new Date(booking.booking_date),
        booking_start_time: `${hh}:${mm}`,
        status: booking.status,
      });

      bookingServices.forEach((svc: any, idx: number) => {
        if (svc.service_id) fetchStaffForRow(idx, svc.service_id);
      });
    } else {
      reset({
        customer_name: "",
        customer_phone: "",
        services: [{ ...EMPTY_SERVICE }],
        booking_date: new Date(),
        booking_start_time: "",
        status: BOOKING_STATUS.CONFIRMED,
      });
    }
  }, [mode, booking, reset, open]);

  const getStaffOptions = (rowIndex: number) => {
    const rowData = staffMap[rowIndex];
    if (!rowData?.data) return [];
    return rowData.data.map((ss) => {
      const lastName = ss.staff.last_name ? ` ${ss.staff.last_name}` : "";
      return {
        label: `${ss.staff.first_name}${lastName}`,
        value: String(ss.staff_id),
      };
    });
  };

  const getStaffService = (rowIndex: number, staffId: any): ServiceStaff | undefined => {
    return staffMap[rowIndex]?.data?.find((ss) => ss.staff_id === Number(staffId));
  };

  const isStaffLoading = (rowIndex: number) => staffMap[rowIndex]?.loading ?? false;

  const totals = useMemo(() => {
    let totalPrice = 0;
    let totalDuration = 0;
    let completedCount = 0;

    (watchedServices ?? []).forEach((svc, idx) => {
      const ss = getStaffService(idx, svc.staff_id);
      if (ss) {
        totalPrice += Number(ss.price) || 0;
        totalDuration += Number(ss.duration) || 0;
        completedCount++;
      }
    });

    return { totalPrice, totalDuration, count: completedCount };
  }, [watchedServices, staffMap]);

  const handleAddService = () => {
    append({ ...EMPTY_SERVICE });
  };

  const handleRemoveService = (index: number) => {
    remove(index);
    setStaffMap((prev) => {
      const next: StaffMap = {};
      Object.entries(prev).forEach(([k, v]) => {
        const key = Number(k);
        if (key < index) next[key] = v;
        else if (key > index) next[key - 1] = v;
      });
      return next;
    });
  };

  const onSubmit: SubmitHandler<BookingFormValues> = async (values) => {
    setIsLoading(true);
    try {
      const bookingDate = dayjs(values.booking_date, "DD-MM-YYYY").isValid()
        ? dayjs(values.booking_date, "DD-MM-YYYY")
        : dayjs(values.booking_date);

      const payload = {
        admin_booking: {
          name: values.customer_name,
          phone: values.customer_phone,
        },
        booking_date: bookingDate.format("YYYY-MM-DD"),
        booking_start_time: `${bookingDate.format("YYYY-MM-DD")}T${values.booking_start_time}:00Z`,
        services: values.services.map((s, i) => ({
          service_id: Number(s.service_id),
          staff_id: Number(s.staff_id),
          sequence: i + 1,
        })),
        status: values.status,
      };

      if (mode === "create") {
        await dispatch(createBookingAction(payload as any)).unwrap();
        callSnack("Booking created successfully", "success");
      } else {
        await dispatch(
          updateBookingAction({
            uuid: booking.uuid,
            body: payload as any,
          }),
        ).unwrap();
        callSnack("Booking updated successfully", "success");
      }
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || "Failed to save booking";
      callSnack(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const canAddMore = fields.length < services.length;

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isLoading && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialog }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className={clsx(styles.dialogTitle)} fontWeight="fontWeightMedium" variant="h5">
        {mode === "create" ? "Create Booking" : "Update Booking"}
      </DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <DialogContent className={clsx("flex flex-col py-4 px-6", styles.dialogContent)}>
            <Box className="grid grid-cols-2 gap-4">
              <Box className="flex flex-col gap-1.5">
                <Typography variant="body2" fontWeight="bold">
                  Customer Name
                </Typography>
                <TextField
                  type="text"
                  name="customer_name"
                  label="Customer Name"
                  placeholder="Enter name"
                  control={control as any}
                  identifier="booking-customer-name"
                />
              </Box>
              <Box className="flex flex-col gap-1.5">
                <Typography variant="body2" fontWeight="bold">
                  Customer Phone
                </Typography>
                <TextField
                  type="text"
                  name="customer_phone"
                  label="Customer Phone"
                  placeholder="Enter phone number"
                  control={control as any}
                  identifier="booking-customer-phone"
                />
              </Box>
            </Box>

            <Divider className="my-4" />

            <Box>
              <Box className="flex items-center justify-between mb-3">
                <Typography variant="body2" fontWeight="bold">
                  Services ({fields.length})
                </Typography>
                {canAddMore && (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                    onClick={handleAddService}
                    sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8rem" }}
                  >
                    Add Service
                  </Button>
                )}
              </Box>

              <Box className="flex flex-col gap-2.5">
                {fields.map((field, index) => {
                  const rowServiceOptions = getServiceOptionsForRow(index);
                  const staffOptions = getStaffOptions(index);
                  const staffLoading = isStaffLoading(index);
                  const selectedStaff = getStaffService(index, watchedServices?.[index]?.staff_id);

                  return (
                    <Box
                      key={field.id}
                      className="rounded-lg border border-gray-200 px-4 pt-3 pb-3 relative"
                      sx={{
                        bgcolor: "grey.50",
                        transition: "border-color 0.15s",
                        "&:hover": { borderColor: "grey.400" },
                      }}
                    >
                      <Box className="flex items-start gap-3">
                        <Box className="flex-1 min-w-0">
                          <Select
                            name={`services.${index}.service_id`}
                            placeholder="Select Service"
                            identifier={`booking-service-${index}`}
                            options={rowServiceOptions}
                            translate={false}
                            control={control as any}
                          />
                        </Box>

                        <Box className="flex-1 min-w-0">
                          <Select
                            name={`services.${index}.staff_id`}
                            placeholder={staffLoading ? "Loading..." : "Select Staff"}
                            identifier={`booking-staff-${index}`}
                            options={staffOptions}
                            translate={false}
                            disabled={!watchedServices?.[index]?.service_id || staffLoading}
                            control={control as any}
                          />
                        </Box>

                        {fields.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveService(index)}
                            sx={{
                              mt: 0.75,
                              width: 30,
                              height: 30,
                              color: "grey.500",
                              "&:hover": { bgcolor: "grey.200", color: "grey.700" },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>

                      {selectedStaff && (
                        <Box className="flex items-center gap-3 mt-2 pl-0.5">
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {Number(selectedStaff.duration)} mins
                          </Typography>
                          <Typography variant="caption" fontWeight="bold" color="primary">
                            {formatPrice(Number(selectedStaff.price))}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {totals.count > 0 && (
                <Box
                  className="mt-3 rounded-lg py-2.5 px-4 flex items-center justify-between"
                  sx={{ bgcolor: "primary.50", border: "1px solid", borderColor: "primary.100" }}
                >
                  <Typography variant="caption" fontWeight="medium" sx={{ color: "text.secondary" }}>
                    {totals.count} service{totals.count > 1 ? "s" : ""} · {totals.totalDuration} mins total
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {formatPrice(totals.totalPrice)}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider className="my-4" />

            <Box className="grid grid-cols-2 gap-4">
              <Box className="flex flex-col gap-1.5">
                <Typography variant="body2" fontWeight="bold">
                  Date
                </Typography>
                <DatePicker
                  name="booking_date"
                  placeholder="Booking Date"
                  control={control as any}
                  identifier="booking-date"
                />
              </Box>
              <Box className="flex flex-col gap-1.5">
                <Typography variant="body2" fontWeight="bold">
                  Time
                </Typography>
                <TimePicker
                  name="booking_start_time"
                  placeholder="Start Time"
                  control={control as any}
                  identifier="booking-start-time"
                />
              </Box>
            </Box>

            {mode === "update" && (
              <>
                <Divider className="my-4" />
                <Box className="flex flex-col gap-1.5">
                  <Typography variant="body2" fontWeight="bold">
                    Status
                  </Typography>
                  <Select
                    name="status"
                    placeholder="Select Status"
                    identifier="booking-status"
                    options={[
                      { label: "Confirmed", value: BOOKING_STATUS.CONFIRMED },
                      { label: "Completed", value: BOOKING_STATUS.COMPLETED },
                      { label: "Cancelled", value: BOOKING_STATUS.CANCELLED },
                    ]}
                    translate={false}
                    control={control as any}
                  />
                </Box>
              </>
            )}
          </DialogContent>

          <DialogActions className={clsx(styles.dialogActions, "px-6 py-4")}>
            <Button onClick={onClose} disabled={isLoading} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} variant="contained">
              {isLoading ? (
                <Box className="flex items-center gap-2">
                  <CircularProgress size={16} color="inherit" />
                  Saving...
                </Box>
              ) : mode === "create" ? (
                "Create Booking"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
