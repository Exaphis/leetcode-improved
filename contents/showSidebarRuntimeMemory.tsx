import { finder } from "@medv/finder";
import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIMountState,
  PlasmoGetInlineAnchorList
} from "plasmo";
import { useCallback, useEffect, useState } from "react";

const RuntimeMemoryTags = () => {
  const [runtime, setRuntime] = useState("");
  const [memory, setMemory] = useState("");
  const [currElem, setCurrElem] = useState(null);

  useEffect(() => {
    let selector = "";
    function handleReactProps(event) {
      if (
        event.data.source === "lci-bg-get-react-props" &&
        event.data.selector === selector &&
        event.data.reactProps
      ) {
        const { runtime, memory } = event.data.reactProps.submission;
        setRuntime(runtime);
        setMemory(memory);
      }
    }

    function refreshStats() {
      // fetch the runtime and memory information from the react props of the submission
      if (!currElem) return;
      const submissionEl =
        currElem.parentElement.parentElement.parentElement.parentElement;

      selector = finder(submissionEl);
      // send message to background script as content script cannot access certain element properties
      // https://github.com/PlasmoHQ/plasmo/discussions/174
      window.addEventListener("message", handleReactProps);

      window.postMessage({
        source: "lci-cs-get-react-props",
        selector: selector
      });
    }

    // add a timer to refresh the stats every second
    // otherwise, the stats will duplicate when the user creates a new submission
    refreshStats();
    const interval = setInterval(refreshStats, 1000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("message", handleReactProps);
    };
  }, [currElem]);

  const taggedRef = useCallback((ref: HTMLDivElement) => {
    if (!ref) return;
    // display relative is set by default in the parent, which makes the tags float over
    // the header upon scroll
    ref.parentElement.setAttribute("style", "");

    // width is set to 100px in the tag container, remove this to prevent the tag text from wrapping
    ref.parentElement.parentElement.parentElement.setAttribute(
      "style",
      "width: auto"
    );
    setCurrElem(ref);
  }, []);

  return (
    <div
      className="flex gap-4 text-label-2 dark:text-dark-label-2"
      ref={taggedRef}>
      <span className="bg-fill-3 dark:bg-dark-fill-3 flex px-3 py-1 text-xs rounded-full">
        {`Runtime: ${runtime}`}
      </span>
      <span className="bg-fill-3 dark:bg-dark-fill-3 flex px-3 py-1 text-xs rounded-full">
        {`Memory: ${memory}`}
      </span>
    </div>
  );
};

export default RuntimeMemoryTags;

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/*"],
  all_frames: true
};

// select the language tag span on the submission element
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  return document.querySelectorAll(
    "#qd-content > div.h-full.flex-col.ssg__qd-splitter-primary-w > div > div > div > div.flex.h-full.w-full.overflow-y-auto.rounded-b > div > div.h-full > div.flex.h-\\[71px\\].cursor-pointer.items-center.justify-between.py-3.px-4 > div.flex.h-full.max-w-full.flex-shrink-0.items-center.gap-3 > div.flex.w-\\[100px\\].flex-shrink-0.items-center.gap-3 > span"
  );
};

export const getRootContainer = async ({
  anchor,
  mountState
}: {
  anchor: PlasmoCSUIAnchor;
  mountState?: PlasmoCSUIMountState;
}) => {
  const container = document.createElement("div");

  mountState?.hostSet.add(container);
  mountState?.hostMap.set(container, anchor);

  anchor.element.insertAdjacentElement("afterend", container);
  return container;
};
