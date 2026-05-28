import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { Box, Button, LinearProgress, CircularProgress } from "@mui/material";
import OwnerStep from "./_components/onboarding-steps/owner-step";
import SalonStep from "./_components/onboarding-steps/salon-step";
import AddressStep from "./_components/onboarding-steps/address-step";
import { callSnack } from "../../components/snackbar";
import { SalonOnboardingSchema, type SalonOnboardingForm } from "./schema/salon-onboarding.schema";
import { updateSalon } from "../../features/salon-onboarding/update-salon/update-salon.service";
import { useAppDispatch } from "../../store/hooks";
import { completeOnboarding } from "../../features/auth/auth.slice";

const TOTAL_STEPS = 3;

export default function SalonOnboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const methods = useForm<SalonOnboardingForm>({
    resolver: zodResolver(SalonOnboardingSchema),
    mode: "all",
    defaultValues: {
      owner: { owner_name: "" },
      salon: {
        type: "",
        logo: null,
        photos: [],
      },
      address: {
        address: "",
        map_link: "",
        latitude: undefined,
        longitude: undefined,
      },
    },
  });

  const { trigger, getValues } = methods;

  const progress = ((activeStep + 1) / TOTAL_STEPS) * 100;

  const handleNext = async () => {
    let fieldsToValidate: (keyof SalonOnboardingForm | string)[] = [];

    if (activeStep === 0) fieldsToValidate = ["owner.owner_name"];
    if (activeStep === 1) fieldsToValidate = ["salon.type", "salon.logo", "salon.photos"];
    if (activeStep === 2) fieldsToValidate = ["address.address", "address.map_link"];

    const isValid = await trigger(fieldsToValidate as any);
    if (!isValid) return;

    if (activeStep < TOTAL_STEPS - 1) {
      setActiveStep((s) => s + 1);
      return;
    }
    const data = getValues();
    try {
      setIsLoading(true);
      await updateSalon({
        owner_name: data.owner?.owner_name,
        type: data.salon?.type,
        logo: data.salon?.logo?.url,
        photos: data.salon.photos,
        latitude: String(data?.address?.latitude),
        longitude: String(data?.address?.longitude),
        address: data?.address?.address,
        map_link: data?.address?.map_link,
        is_onboarded: true,
      });
      dispatch(completeOnboarding({}));
      callSnack("Onboarding completed", "success");
      navigate("/dashboard");
    } catch {
      callSnack("Failed to save salon details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) return;
    setActiveStep((s) => s - 1);
  };

  return (
    <FormProvider {...methods}>
      <Box className="flex items-center justify-center min-h-screen p-4">
        <Box className="w-full max-w-lg p-6 flex flex-col gap-6 rounded-xl border border-[#e5e5e5]">
          <Box className="flex flex-col items-center mb-2">
            <Box className="w-16 h-16 bg-(--primary-900) rounded-lg flex items-center justify-center mb-4">
              <ContentCutIcon className="text-white!" />
            </Box>
            <Box>Salon Onboarding</Box>
            <Box className="text-(--primary-900)">
              Step {activeStep + 1} of {TOTAL_STEPS}
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />

          <Box className="mt-4">
            {activeStep === 0 && <OwnerStep />}
            {activeStep === 1 && <SalonStep />}
            {activeStep === 2 && <AddressStep />}
          </Box>
          <Box className="w-full flex items-center justify-between mt-4">
            <Button variant="outlined" disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Button variant="contained" onClick={handleNext} disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}>
              {activeStep === TOTAL_STEPS - 1 ? (isLoading ? "Finishing..." : "Finish") : (isLoading ? "Processing..." : "Next")}
            </Button>
          </Box>
        </Box>
      </Box>
    </FormProvider>
  );
}
