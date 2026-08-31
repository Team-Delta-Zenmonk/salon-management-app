import { useState } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import clsx from "clsx";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, Layers, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CustomCheckboxTreeProps, CheckboxTreeNode } from "./checkbox-tree.type";

const CheckboxTree = <T extends FieldValues>({
  name,
  control,
  rules,
  identifier,
  showError = true,
  options,
}: CustomCheckboxTreeProps<T>) => {
  // Store expanded/collapsed state for parent nodes
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const traverse = (nodes: CheckboxTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          initial[n.value] = true; // All nodes expanded by default
          traverse(n.children);
        }
      });
    };
    traverse(options);
    return initial;
  });

  const toggleExpand = (value: string) => {
    setExpanded((prev) => ({ ...prev, [value]: !prev[value] }));
  };

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

    const nodeId = `${identifier}-${node.value}`;
    const isExpanded = expanded[node.value] ?? false;

    if (isParent) {
      return (
        <div key={node.value} className="flex flex-col gap-1.5">
          <div
            className={clsx(
              "flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 group/parent",
              checked
                ? "bg-primary/10 border-primary/20"
                : indeterminate
                  ? "bg-primary/5 border-primary/15"
                  : "bg-card/40 border-border/40 hover:bg-card hover:border-border/60",
              node.disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            <div
              className={clsx(
                "flex items-center space-x-3 flex-1 min-w-0 select-none",
                !node.disabled && "cursor-pointer"
              )}
              onClick={() => !node.disabled && handleParentChange(node, onChange, storedValue)}
            >
              <Checkbox
                id={nodeId}
                checked={checked}
                indeterminate={indeterminate}
                disabled={node.disabled}
                onCheckedChange={() => handleParentChange(node, onChange, storedValue)}
                onBlur={onBlur}
                ref={ref}
                data-test-id={nodeId}
                className="pointer-events-none shrink-0"
              />
              <span
                className={clsx(
                  "p-1.5 rounded-lg border transition-colors shrink-0",
                  checked || indeterminate
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-muted/40 border-border/30 text-muted-foreground group-hover/parent:text-foreground"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
              </span>
              <Label
                htmlFor={nodeId}
                className={clsx(
                  "text-sm font-semibold tracking-wide text-foreground truncate select-none cursor-pointer",
                  node.disabled && "cursor-not-allowed"
                )}
              >
                {node.label}
              </Label>
            </div>
            
            <button
              type="button"
              disabled={node.disabled}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.value);
              }}
              className="p-1 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all shrink-0 ml-2"
            >
              <ChevronDown
                className={clsx(
                  "w-4 h-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="ml-5 flex flex-col gap-1.5 border-l border-border/40 pl-3.5 py-0.5">
                  {node.children!.map((child) => renderNode(child, onChange, storedValue, onBlur, ref))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div
        key={node.value}
        className={clsx(
          "flex items-center p-2 rounded-lg border transition-all duration-200 group/child",
          checked
            ? "bg-primary/5 border-primary/15"
            : "bg-transparent border-transparent hover:bg-muted/30 hover:border-border/10",
          node.disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <div
          className={clsx(
            "flex items-center space-x-2.5 flex-1 min-w-0 select-none",
            !node.disabled && "cursor-pointer"
          )}
          onClick={() => !node.disabled && handleChildChange(node.value, onChange, storedValue)}
        >
          <Checkbox
            id={nodeId}
            checked={checked}
            disabled={node.disabled}
            onCheckedChange={() => handleChildChange(node.value, onChange, storedValue)}
            onBlur={onBlur}
            ref={ref}
            data-test-id={nodeId}
            className="pointer-events-none shrink-0"
          />
          <span
            className={clsx(
              "p-1 rounded-md border transition-colors shrink-0",
              checked
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-muted/20 border-border/10 text-muted-foreground/60 group-hover/child:text-muted-foreground"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <Label
            htmlFor={nodeId}
            className={clsx(
              "text-xs font-medium text-foreground/80 truncate select-none cursor-pointer",
              node.disabled && "cursor-not-allowed"
            )}
          >
            {node.label}
          </Label>
        </div>
      </div>
    );
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value: storedValue, onBlur, ref }, fieldState: { error } }) => {
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {options.map((node) => renderNode(node, onChange, storedValue, onBlur, ref))}
            </div>
            {showError && error?.message && (
              <p
                className="text-xs font-medium text-destructive"
                data-test-id={`checkbox-tree-error-${identifier}`}
              >
                {error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default CheckboxTree;
