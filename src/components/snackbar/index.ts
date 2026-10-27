import React from "react";
import { closeSnackbar, enqueueSnackbar, type VariantType } from "notistack";
import { X } from "lucide-react";
import { APP_NAME } from "@/constants/app";
import { getSnackBarStyles } from "./snackbar.constant";
import { Message } from "./_components/message";
import { extractErrorMessage } from "@/utils/api-error";

export { extractErrorMessage, closeSnackbar };

const appName = APP_NAME.toLowerCase();
let isSuspendedState = false;

export const setAppSuspended = (suspended: boolean) => {
  isSuspendedState = suspended;
  if (suspended) {
    closeSnackbar();
  }
};

export const getAppSuspended = () => isSuspendedState;

if (typeof window !== "undefined") {
  window.addEventListener(`${appName}:account-suspended`, () => {
    setAppSuspended(true);
  });
  window.addEventListener(`${appName}:account-resumed`, () => {
    setAppSuspended(false);
  });
}

export const callSnack = async (
  msgOrError: string | unknown,
  variant: VariantType,
  maxWidth?: number
) => {
  if (
    isSuspendedState &&
    (variant === "error" || variant === "warning")
  ) {
    return;
  }

  const errorObj = msgOrError as { isSuspended?: boolean; isHandledGlobally?: boolean } | null;
  if (errorObj?.isSuspended || errorObj?.isHandledGlobally) {
    return;
  }

  const displayMsg =
    typeof msgOrError === "string"
      ? msgOrError
      : extractErrorMessage(msgOrError, variant === "error" ? "An error occurred" : "");

  if (!displayMsg) return;

  enqueueSnackbar(
    React.createElement(Message, { message: displayMsg, maxWidth, variant }),
    {
      variant: variant || "info",
      hideIconVariant: true,
      style: getSnackBarStyles(variant),
      autoHideDuration: 4000,
      action: (key) =>
        React.createElement(
          "button",
          {
            onClick: () => closeSnackbar(key),
            className:
              "p-1.5 rounded-full hover:bg-black/15 dark:hover:bg-white/20 transition-all ml-2 shrink-0 self-center opacity-80 hover:opacity-100 active:scale-95",
            "data-testid": `btn-snackbar-close-${key}`,
            type: "button",
            "aria-label": "Close notification",
          },
          React.createElement(X, {
            size: 16,
            className: "text-current stroke-[2.5] shrink-0",
          })
        ),
    }
  );
};
