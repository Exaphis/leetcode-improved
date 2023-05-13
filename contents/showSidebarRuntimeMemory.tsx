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
  const [selector, setSelector] = useState("");

  useEffect(() => {
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
      if (!selector) return;

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
  }, [selector]);

  const taggedRef = useCallback(
    (ref: HTMLDivElement) => {
      if (!ref) return;
      // display relative is set by default in the parent, which makes the tags float over
      // the header upon scroll
      ref.parentElement.setAttribute("style", "");

      // fetch the runtime and memory information from the react props of the submission
      const submissionEl =
        ref.parentElement.parentElement.parentElement.parentElement;

      setSelector(finder(submissionEl));
    },
    [setSelector]
  );

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

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(
    String.raw`#qd-content > div.h-full.flex-col.ssg__qd-splitter-primary-w > div > div > div > div.flex.h-full.w-full.overflow-y-auto > div > div.h-full.w-full > div:not(.flex-none) > div.flex.h-full.items-center.gap-4 > div.flex.items-center.gap-4`
  );

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
