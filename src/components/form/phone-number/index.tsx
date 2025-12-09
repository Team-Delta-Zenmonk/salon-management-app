import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Box, Tooltip } from "@mui/material";
import Autocomplete, { type AutocompleteCloseReason } from "@mui/material/Autocomplete";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import InputBase from "@mui/material/InputBase";
import Popper from "@mui/material/Popper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { type FieldValues, useController } from "react-hook-form";
import { RemoveScroll } from "react-remove-scroll";
import { VirtualizedListboxComponent } from "./virtualized-phone-number"
import styles from "./phone-number-select.module.scss";
import type { PhoneNumberSelectProps } from "./phone-number-select.type";

interface PopperComponentProps {
  anchorEl?: any;
  disablePortal?: boolean;
  open: boolean;
}

function PopperComponent(props: Readonly<PopperComponentProps>) {
  const { disablePortal, anchorEl, open, ...other } = props;
  return <Box component="div" {...other} />;
}

const PhoneNumberSelect = <T extends FieldValues>({
  name,
  options,
  control,
  identifier,
  index,
  disabled,
}: PhoneNumberSelectProps<T>) => {
  const {
    field: { onChange, value },
  } = useController({
    name,
    control,
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [textValue, setTextValue] = useState<string>("");
;
  const currentLocale = "es";

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setTextValue("");
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Fragment>
      <Stack
        className={clsx("flex-row justify-center items-center", styles.selectComponent)}
        onClick={disabled ? undefined : handleClick}
        data-test-id={`open-country-code-menu-${identifier}`}
      >
        <Typography
          variant="titleMd"
          className="flex items-center justify-center gap-2"
          data-test-id="country-flag-emoji"
        >
          {value?.flagEmoji}
          <Tooltip
            title={`+${value?.phoneCode}`}
            slotProps={{
              popper: { modifiers: [{ name: "offset", options: { offset: [0, 0] } }] },
            }}
          >
            <Typography
              component="span"
              variant="paragraphSm"
              color="secondary.800"
              className={disabled ? styles.selectedCountryTextDisabled : styles.selectedCountryText}
              data-test-id={`text-country-phone-code-${index}`}
            >
              +{value?.phoneCode}
            </Typography>
          </Tooltip>
        </Typography>
        {open ? <ArrowDropUpIcon className="iconSizeStyles" /> : <ArrowDropDownIcon className="iconSizeStyles" />}
      </Stack>
      {open && (
        <RemoveScroll>
          <Popper open={open} anchorEl={anchorEl} placement="bottom-start" className={styles.popper}>
            <ClickAwayListener
              onClickAway={(event) => {
                const target = event.target as HTMLElement;
                if (!target.classList.contains("country-select")) {
                  event.preventDefault();
                  handleClose();
                }
              }}
            >
              <Autocomplete
                disabled={disabled}
                open={open}
                onClose={(event, reason: AutocompleteCloseReason) => {
                  if (reason === "escape") {
                    event.preventDefault();
                    handleClose();
                  }
                }}
                value={value}
                onChange={(event, newValue, reason) => {
                  if (
                    reason === "clear" ||
                    (event.type === "keydown" &&
                      ((event as React.KeyboardEvent).key === "Backspace" ||
                        (event as React.KeyboardEvent).key === "Delete") &&
                      reason === "removeOption")
                  ) {
                    return;
                  }
                  onChange(newValue);
                  handleClose();
                }}
                renderValue={() => null}
                noOptionsText={
                  <Typography variant="paragraphMd" data-test-id={`text-${identifier}-no-options`}>
                    {"No Options"}
                  </Typography>
                }
                openText={"Open"}
                closeText={"Close"}
                renderOption={(props, option, state) => [props, option, state.index] as React.ReactNode}
                options={[...options].sort((a, b) => {
                  const isASelected = a.name === value?.name;
                  const isBSelected = b.name === value?.name;
                  if (isASelected && !isBSelected) return -1;
                  if (!isASelected && isBSelected) return 1;
                  return options.indexOf(a) - options.indexOf(b);
                })}
                getOptionLabel={(option: any) => {
                  return option?.translations?.[currentLocale] ?? option?.name;
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                inputValue={textValue}
                renderInput={(params) => (
                  <InputBase
                    ref={params.InputProps.ref}
                    inputProps={{
                      ...params.inputProps,
                      "data-test-id": "input-filter-flag",
                    }}
                    autoFocus
                    placeholder={"Flag"}
                    onBeforeInput={(e) => {
                      e.stopPropagation();
                    }}
                    onChange={(e) => setTextValue(e.target.value)}
                    className={styles.textField}
                  />
                )}
                slots={{
                  popper: PopperComponent,
                }}
                slotProps={{
                  paper: {
                    className: styles.listBox,
                  },
                  listbox: { component: VirtualizedListboxComponent },
                  clearIndicator: {
                    ...({
                      "data-test-id": `btn-autocomplete-clear-${identifier}`,
                    } as any),
                  },
                  popupIndicator: {
                    ...({
                      "data-test-id": `btn-autocomplete-arrow-${identifier}`,
                    } as any),
                  },
                }}
                data-test-id={`autocomplete-${identifier}`}
              />
            </ClickAwayListener>
          </Popper>
        </RemoveScroll>
      )}
    </Fragment>
  );
};

export default PhoneNumberSelect;
