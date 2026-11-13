import { useEffect } from "react";

export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock || typeof document === "undefined") return;

    const scrollContainer = document.getElementById("main-content-scroll");
    const docEl = document.documentElement;
    const body = document.body;

    const prevContainerOverflow = scrollContainer?.style.overflowY;
    const prevBodyOverflow = body.style.overflowY;
    const prevHtmlOverflow = docEl.style.overflowY;

    if (scrollContainer) {
      scrollContainer.style.overflowY = "hidden";
    }
    body.style.overflowY = "hidden";
    docEl.style.overflowY = "hidden";

    return () => {
      if (scrollContainer && prevContainerOverflow !== undefined) {
        scrollContainer.style.overflowY = prevContainerOverflow;
      }
      body.style.overflowY = prevBodyOverflow;
      docEl.style.overflowY = prevHtmlOverflow;
    };
  }, [lock]);
}

export default useScrollLock;

