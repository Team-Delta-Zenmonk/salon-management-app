export const normalizeFormValue = (val: any): any => {
  if (val === null || val === undefined) return "";
  if (typeof val === "boolean" || typeof val === "number") return val;
  if (typeof val === "string") return val.trim();
  if (val instanceof Date) return val.toISOString();
  if (val && typeof val === "object") {
    if (typeof val.toISOString === "function") {
      try {
        return val.toISOString();
      } catch {
        return "";
      }
    }
    if (Array.isArray(val)) {
      return val.map(normalizeFormValue);
    }
    const res: Record<string, any> = {};
    for (const key of Object.keys(val).sort()) {
      res[key] = normalizeFormValue(val[key]);
    }
    return res;
  }
  return val;
};

export const isFormChanged = (initial: any, current: any): boolean => {
  if (!initial) return false;
  return JSON.stringify(normalizeFormValue(initial)) !== JSON.stringify(normalizeFormValue(current));
};

