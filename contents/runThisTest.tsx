import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIMountState,
  PlasmoGetInlineAnchor
} from "plasmo";

import {
  CONSOLE_TESTCASE_TAG_SELECTOR,
  CURRENT_CONSOLE_TESTCASE_TAG_SELECTOR,
  RUN_BUTTON_SELECTOR,
  TESTCASE_VARIABLE_FIELD_WRAPPER_SELECTOR
} from "~selectors";

const CustomButton = () => {
  function handleClick() {
    // find current test case number
    const testCaseNum = parseInt(
      (
        document.querySelector(
          CURRENT_CONSOLE_TESTCASE_TAG_SELECTOR
        ) as HTMLElement
      ).innerText.substring("Case ".length)
    );
    const numTestCases = document.querySelectorAll(
      CONSOLE_TESTCASE_TAG_SELECTOR
    ).length;

    // since a background service worker overrides the fetch API in the current page, it can't access
    // any of the service worker's local variables.
    // we can't access the window object here either since we're in a content script.
    // so we can use the DOM to pass data to the background script. (there must be a better way to do this)
    document.body.setAttribute("data-test-case-num", testCaseNum.toString());
    document.body.setAttribute("data-num-test-cases", numTestCases.toString());
    (document.querySelector(RUN_BUTTON_SELECTOR) as HTMLElement).click();
  }

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1.5 font-medium items-center whitespace-nowrap transition-all focus:outline-none inline-flex bg-fill-3 dark:bg-dark-fill-3 hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-label-2 dark:text-dark-label-2 rounded-lg pl-3 pr-2">
      Run this test case
    </button>
  );
};

export default CustomButton;

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/*"],
  all_frames: true
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () =>
  document.querySelector(TESTCASE_VARIABLE_FIELD_WRAPPER_SELECTOR);

export const getRootContainer = async ({
  anchor,
  mountState
}: {
  anchor: PlasmoCSUIAnchor;
  mountState?: PlasmoCSUIMountState;
}) => {
  const container = document.createElement("div");
  container.id = "lci-runThisTest";

  mountState?.hostSet.add(container);
  mountState?.hostMap.set(container, anchor);

  anchor.element.insertAdjacentElement("afterend", container);
  return container;
};
