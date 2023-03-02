import type { PlasmoCSConfig } from "plasmo";

import { Storage } from "@plasmohq/storage";

import { Settings, getOrSetDefault } from "~settings";

(async () => {
  const storage = new Storage();
  const autoStartTimer = await getOrSetDefault(
    storage,
    Settings.AUTO_START_TIMER
  );
  const observer = new MutationObserver((_, instance) => {
    if (!document.getElementById("editor")) {
      return;
    }

    const clock = document.querySelector(
      "#__next > div > div > div > nav > div > div > div.relative.ml-4.flex.items-center.space-x-4 > div.hidden.lc-lg\\:block > div > div > div"
    ) as HTMLElement;

    if (clock && autoStartTimer) {
      clock.click();
      instance.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/*"],
  all_frames: true
};
