import type { PlasmoCSConfig } from "plasmo";

import { Storage } from "@plasmohq/storage";

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
      "#qd-content > div.h-full.flex-col.ssg__qd-splitter-secondary-w > div > div:nth-child(3) > div > div > div:nth-child(3) > div > div > div.ml-auto.flex.items-center.space-x-4 > button.px-3.py-1\\.5.font-medium.items-center.whitespace-nowrap.transition-all.focus\\:outline-none.inline-flex.bg-fill-3.dark\\:bg-dark-fill-3.hover\\:bg-fill-2.dark\\:hover\\:bg-dark-fill-2.text-label-2.dark\\:text-dark-label-2.rounded-lg"
    ) as HTMLElement;

    const errorSpan = document.querySelector(
      "#qd-content > div.h-full.flex-col.ssg__qd-splitter-secondary-w > div > div:nth-child(3) > div > div > div.flex.flex-grow.overflow-y-auto > div > div.flex.h-full.items-center.justify-center.p-4.text-label-4.dark\\:text-dark-label-4 > span:nth-child(1)"
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
