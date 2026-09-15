import React from "react";
import { closeSnackbar, enqueueSnackbar, type VariantType } from "notistack";
import { X } from "lucide-react";
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
        "button",
        { 
          onClick: () => closeSnackbar(key), 
          className: "p-1.5 rounded-full hover:bg-black/15 dark:hover:bg-white/20 transition-all ml-3 shrink-0 opacity-80 hover:opacity-100 active:scale-95", 
          "data-testid": `btn-snackbar-close-${key}` 
        } as any,
        React.createElement(X, {
          size: 16,
          className: "text-current stroke-[2.5]",
          "data-testid": "icon-snackbar-close",
        } as any)
      ),
  });
};
