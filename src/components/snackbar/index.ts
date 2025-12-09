import React from "react";
import { closeSnackbar, enqueueSnackbar, type VariantType } from "notistack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { getSnackBarStyles } from "./snackbar.constant";
import { Message } from "./_components/message";
export const callSnack = async (msg: string, variant: VariantType, maxWidth?: number) => {
  enqueueSnackbar(React.createElement(Message, { message: msg, maxWidth: maxWidth, variant: variant }), {
    variant: variant || "info",
    hideIconVariant: true,
    style: getSnackBarStyles(variant),
    autoHideDuration: 4000,

    action: (key) =>
      React.createElement(
        IconButton,
        { onClick: () => closeSnackbar(key), className: "p-10", "data-testid": `btn-snackbar-close-${key}` } as any,
        React.createElement(CloseIcon, {
          fontSize: "small",
          sx: { color: "var(--secondary-600)" },
          "data-testid": "icon-snackbar-close",
        } as any)
      ),
  });
};
