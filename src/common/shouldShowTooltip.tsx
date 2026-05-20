"use client";

export const shouldShowTooltip = (text: string, width: string) => {
  if (typeof document !== "undefined") {
    const element = document.createElement("div");
    element.style.overflow = "hidden";
    element.style.whiteSpace = "nowrap";
    element.style.textOverflow = "ellipsis";
    element.style.width = width;
    element.innerHTML = text;
    document.body.appendChild(element);
    const isOverflowing = element.scrollWidth > element.clientWidth;
    element.remove();
    return isOverflowing;
  }
  
  return false;
};
