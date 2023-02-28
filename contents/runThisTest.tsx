import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIMountState,
  PlasmoGetOverlayAnchor
} from "plasmo";

const CustomButton = () => {
  function handleClick() {
    // find current test case number
    const testCaseNum = parseInt(
      (
        document.querySelector(
          "#qd-content > div.h-full.flex-col.ssg__qd-splitter-secondary-w > div > div:nth-child(3) > div > div > div.flex.flex-grow.overflow-y-auto > div > div > div > div.flex.w-full.flex-row.items-start.justify-between.gap-4 > div > button.dark\\:bg-dark-fill-3"
        ) as HTMLElement
      ).innerText.substring("Case ".length)
    );
    const numTestCases = document.querySelectorAll(
      "#qd-content > div.h-full.flex-col.ssg__qd-splitter-secondary-w > div > div:nth-child(3) > div > div > div.flex.flex-grow.overflow-y-auto > div > div > div > div.flex.w-full.flex-row.items-start.justify-between.gap-4 > div > button.rounded-lg"
    ).length;

    // since a background service worker overrides the fetch API in the current page, it can't access
    // any of the service worker's local variables.
    // we can't access the window object here either since we're in a content script.
    // so we can use the DOM to pass data to the background script. (there must be a better way to do this)
    document.body.setAttribute("data-test-case-num", testCaseNum.toString());
    document.body.setAttribute("data-num-test-cases", numTestCases.toString());
    (
      document.querySelector(
        "#qd-content > div.h-full.flex-col.ssg__qd-splitter-secondary-w > div > div:nth-child(3) > div > div > div > div > div > div.ml-auto.flex.items-center.space-x-4 > button.px-3.py-1\\.5.font-medium.items-center.whitespace-nowrap.transition-all.focus\\:outline-none.inline-flex.bg-fill-3.dark\\:bg-dark-fill-3.hover\\:bg-fill-2.dark\\:hover\\:bg-dark-fill-2.text-label-2.dark\\:text-dark-label-2.rounded-lg"
      ) as HTMLElement
    ).click();
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

export const getInlineAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector(
    "#qd-content > div.h-full.flex-col.ssg__qd-splitter-secondary-w > div > div:nth-child(3) > div > div > div.flex.flex-grow.overflow-y-auto > div > div > div > div.space-y-4"
  );

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
