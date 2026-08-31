import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import { Plus, X, Loader2 } from "lucide-react";
import { FormProvider, useForm, useFieldArray, useWatch, type SubmitHandler } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { callSnack } from "../../../../components/snackbar";
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
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import BookingServiceRow from "./_components/booking-service-row";

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

  const allServiceOptions = useMemo(() => {
    const parentIds = new Set<number>();
    services.forEach((s: any) => {
      if (s.parent_id) parentIds.add(s.parent_id);
    });
    return services
      .filter((s: any) => !parentIds.has(s.id))
      .map((s: any) => ({ label: s.name, value: String(s.id) }));
  }, [services]);

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
          name: values.customer_name?.trim().toLowerCase(),
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
      const errorMessage = error || "Failed to save booking";
      callSnack(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const canAddMore = fields.length < allServiceOptions.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (isLoading) return;
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[680px] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {mode === "create" ? "Create Booking" : "Update Booking"}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit as any)}>
            <div className="flex flex-col py-5 px-6 gap-5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-5">
                <TextField
                  type="text"
                  name="customer_name"
                  label="Customer Name"
                  placeholder="Enter name"
                  control={control as any}
                  identifier="booking-customer-name"
                  maxLength={50}
                  pattern={VALIDATE_PATTERN.alphabet}
                />
                <TextField
                  type="text"
                  name="customer_phone"
                  label="Customer Phone"
                  placeholder="Enter phone number"
                  control={control as any}
                  identifier="booking-customer-phone"
                  maxLength={10}
                  pattern={VALIDATE_PATTERN.number}
                />
              </div>

              <Separator className="my-1 border-border/50" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-foreground/80">Services ({fields.length})</span>
                  {canAddMore && (
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={handleAddService}
                      className="font-medium text-xs h-8 rounded-full shadow-sm hover:shadow-md transition-shadow bg-muted hover:bg-muted/80 border-border"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Service
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {fields.map((field, index) => (
                    <BookingServiceRow
                      key={field.id}
                      index={index}
                      control={control}
                      serviceOptions={getServiceOptionsForRow(index)}
                      staffOptions={getStaffOptions(index)}
                      staffLoading={isStaffLoading(index)}
                      selectedStaff={getStaffService(index, watchedServices?.[index]?.staff_id)}
                      showRemoveButton={fields.length > 1}
                      onRemove={() => handleRemoveService(index)}
                      watchedServiceId={watchedServices?.[index]?.service_id}
                    />
                  ))}
                </div>

                {totals.count > 0 && (
                  <div className="mt-4 rounded-xl py-3 px-5 flex items-center justify-between bg-primary/5 border border-primary/20 shadow-inner">
                    <span className="text-xs font-semibold text-primary/70">
                      {totals.count} service{totals.count > 1 ? "s" : ""} · {totals.totalDuration} mins total
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(totals.totalPrice)}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-1 border-border/50" />

              <div className="grid grid-cols-2 gap-5">
                <DatePicker
                  name="booking_date"
                  label="Booking Date"
                  placeholder="Select Date"
                  control={control as any}
                  identifier="booking-date"
                />
                <TimePicker
                  name="booking_start_time"
                  label="Start Time"
                  placeholder="Select Time"
                  control={control as any}
                  identifier="booking-start-time"
                />
              </div>

              {mode === "update" && (
                <>
                  <Separator className="my-1 border-border/50" />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-foreground/80">Status</span>
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
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 gap-3 sm:gap-3 flex-row justify-end">
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                variant="outline"
                className="rounded-full px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : mode === "create" ? (
                  "Create Booking"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
