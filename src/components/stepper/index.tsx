import { Box, Step, StepConnector, StepLabel, Stepper } from "@mui/material";
import clsx from "clsx";
import styles from "./stepper-header.module.scss";
import type { StepperHeaderStep } from "./stepper-header.type";

type Props = {
  steps: StepperHeaderStep[];
  activeStep: number;
  className?: string;
};

export default function StepperHeader({ steps, activeStep, className }: Props) {
  return (
    <Box className={clsx(styles.container, className)}>
      <Stepper activeStep={activeStep} alternativeLabel className={styles.stepperRoot}>
        {steps.map((s) => (
          <Step key={s.label}>
            <StepLabel
              classes={{
                label: styles.stepLabel,
              }}
              slotProps={{
                stepIcon: {
                  classes: {
                    root: styles.stepIcon,
                    active: styles.stepIconActive,
                    completed: styles.stepIconCompleted,
                  },
                },
              }}
            >
              {s.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
