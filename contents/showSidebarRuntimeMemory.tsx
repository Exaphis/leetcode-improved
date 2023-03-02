import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIMountState,
  PlasmoGetInlineAnchorList
} from "plasmo";
import { useEffect, useRef, useState } from "react";

const RuntimeMemoryTags = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [runtime, setRuntime] = useState("");
  const [memory, setMemory] = useState("");

  const questionSlug = window.location.pathname.split("/")[2];

  // we can get the position of the current submission element by traversing the DOM
  // then, request the runtime/memory information from the GraphQL API

  // information is already given in original fetch request, but then we'll have to
  // relay the information via the DOM or some other method

  // we will have to make a request for every submission, which is not ideal but
  // not too bad as there is likely not many submissions
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    // display relative is set by default in the parent, which makes the tags float over
    // the header upon scroll
    ref.current.parentElement.setAttribute("style", "");

    const submissionEl =
      ref.current.parentElement.parentElement.parentElement.parentElement;
    const submissions = submissionEl.parentElement.children;
    const i = Array.from(submissions).indexOf(submissionEl);

    fetch("https://leetcode.com/graphql/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        query: `
      query submissionList(
        $offset: Int!
        $limit: Int!
        $lastKey: String
        $questionSlug: String!
        $lang: Int
        $status: Int
      ) {
        questionSubmissionList(
          offset: $offset
          limit: $limit
          lastKey: $lastKey
          questionSlug: $questionSlug
          lang: $lang
          status: $status
        ) {
          submissions {
            runtime
            memory
          }
        }
      }`,
        variables: {
          questionSlug,
          offset: i,
          limit: 1
        }
      })
    })
      .then((res) => res.json())
      .then((res) => {
        const { runtime, memory } =
          res.data.questionSubmissionList.submissions[0];
        setRuntime(runtime);
        setMemory(memory);
      });
  }, [ref]);

  return (
    <div className="flex gap-4 text-label-2 dark:text-dark-label-2" ref={ref}>
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
