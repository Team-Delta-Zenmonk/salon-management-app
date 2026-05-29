import { CheckBox, CheckBoxOutlineBlank, IndeterminateCheckBox } from "@mui/icons-material";
import { FormControlLabel, FormGroup, FormHelperText, Checkbox as MuiCheckbox, Box } from "@mui/material";
import { Controller, type FieldValues } from "react-hook-form";
import styles from "./checkbox-tree.module.scss";
import type { CustomCheckboxTreeProps, CheckboxTreeNode } from "./checkbox-tree.type";

const CheckboxTree = <T extends FieldValues>({
  name,
  control,
  rules,
  identifier,
  showError = true,
  options,
}: CustomCheckboxTreeProps<T>) => {
  const getDescendantValues = (node: CheckboxTreeNode): string[] => {
    let vals: string[] = [];
    if (node.children) {
      node.children.forEach((child) => {
        vals.push(child.value);
        vals = vals.concat(getDescendantValues(child));
      });
    }
    return vals;
  };

  const handleParentChange = (
    node: CheckboxTreeNode,
    onChange: (val: string[]) => void,
    storedValue: string[] = [],
  ) => {
    const allValues = [node.value, ...getDescendantValues(node)];
    const isAllChecked = allValues.every((v) => storedValue.includes(v));

    if (isAllChecked) {
      onChange(storedValue.filter((v) => !allValues.includes(v)));
    } else {
      const newValues = new Set([...storedValue, ...allValues]);
      onChange(Array.from(newValues));
    }
  };

  const handleChildChange = (value: string, onChange: (val: string[]) => void, storedValue: string[] = []) => {
    if (storedValue.includes(value)) {
      onChange(storedValue.filter((v) => v !== value));
    } else {
      onChange([...storedValue, value]);
    }
  };

  const renderNode = (
    node: CheckboxTreeNode,
    onChange: (val: string[]) => void,
    storedValue: string[] = [],
    onBlur: () => void,
    ref: any,
  ) => {
    const isParent = !!node.children && node.children.length > 0;

    let checked = false;
    let indeterminate = false;

    if (isParent) {
      const allValues = [node.value, ...getDescendantValues(node)];
      const checkedCount = allValues.filter((v) => storedValue.includes(v)).length;
      checked = checkedCount === allValues.length;
      indeterminate = checkedCount > 0 && checkedCount < allValues.length;
    } else {
      checked = storedValue.includes(node.value);
    }

    return (
      <Box key={node.value}>
        <FormControlLabel
          label={node.label}
          className={styles.checkboxControlLabel}
          classes={{ label: styles.checkboxLabel }}
          control={
            <MuiCheckbox
              onBlur={onBlur}
              checked={checked}
              indeterminate={indeterminate}
              disabled={node.disabled}
              onChange={() =>
                isParent
                  ? handleParentChange(node, onChange, storedValue)
                  : handleChildChange(node.value, onChange, storedValue)
              }
              data-test-id={`${identifier}-${node.value}`}
              className={styles.checkbox}
              slotProps={{ input: { ref } }}
              checkedIcon={<CheckBox />}
              icon={<CheckBoxOutlineBlank />}
              indeterminateIcon={<IndeterminateCheckBox />}
            />
          }
        />
        {isParent && (
          <Box className={styles.childrenContainer}>
            {node.children!.map((child) => renderNode(child, onChange, storedValue, onBlur, ref))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value: storedValue, onBlur, ref }, fieldState: { error } }) => {
        return (
          <FormGroup>
            {options.map((node) => renderNode(node, onChange, storedValue, onBlur, ref))}
            {showError && error?.message && (
              <FormHelperText error data-test-id={`checkbox-tree-error-${identifier}`} className="mt-0 w-100">
                {error.message}
              </FormHelperText>
            )}
          </FormGroup>
        );
      }}
    />
  );
};

export default CheckboxTree;
