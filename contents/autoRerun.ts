import type { PlasmoCSConfig } from "plasmo";

import { Storage } from "@plasmohq/storage";

import { RUN_BUTTON_SELECTOR, RUN_ERROR_SPAN_SELECTOR } from "~selectors";
import { Settings, getOrSetDefault } from "~settings";

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/*"],
  all_frames: true
};
(async () => {
  const storage = new Storage();
  const autoRerun = await getOrSetDefault(storage, Settings.AUTO_RERUN);
  const observer = new MutationObserver((_, instance) => {
    if (!autoRerun) {
      return;
    }

    const runButton = document.querySelector(
      RUN_BUTTON_SELECTOR
    ) as HTMLElement;

    const errorSpan = document.querySelector(
      RUN_ERROR_SPAN_SELECTOR
    ) as HTMLElement;

    if (
      runButton &&
      errorSpan &&
      errorSpan.innerText.includes("You have attempted to run code too soon.")
    ) {
      runButton.click();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
