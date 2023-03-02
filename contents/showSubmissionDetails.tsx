import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIMountState,
  PlasmoGetInlineAnchor
} from "plasmo";
import { useEffect, useState } from "react";

const unescapeUtf8 = (str: string) => {
  return str.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
    return String.fromCharCode(parseInt(grp, 16));
  });
};

const SubmissionDetails = () => {
  const [totalCorrect, setTotalCorrect] = useState<number | null>(null);
  const [totalTestcases, setTotalTestcases] = useState<number | null>(null);
  const [expectedOutput, setExpectedOutput] = useState<string | null>(null);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [path, setPath] = useState(window.location.pathname);

  // update path when the url changes
  // necessary to cause the component to re-render when navigating to a new submission
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setPath(window.location.pathname);
    });

    obs.observe(document, { subtree: true, childList: true });

    return () => obs.disconnect();
  }, []);

  // fetch the submission details (number of test cases, last failing input, etc.)
  // from the old submission page

  // new submission page gets info from the graphql api, which doesn't contain the number
  // of test cases

  // details sometimes can be viewed in id/check, but data disappears after some time
  // (replaced with status: PENDING)
  const submissionId = path.split("/")[4];
  const submissionUrl = `https://leetcode.com/submissions/detail/${submissionId}/`;

  useEffect(() => {
    // clear any previous state
    setTotalCorrect(null);
    setTotalTestcases(null);
    setExpectedOutput(null);
    setCodeOutput(null);

    fetch(submissionUrl)
      .then((response) => response.text())
      .then((text) => {
        const pageData = text.match(/var pageData = {.*?};/gs)[0];

        const totalCorrect = parseInt(
          pageData.match(/total_correct\s*:\s*'(\d+)'/)[1]
        );
        const totalTestcases = parseInt(
          pageData.match(/total_testcases\s*:\s*'(\d+)'/)[1]
        );
        setTotalCorrect(totalCorrect);
        setTotalTestcases(totalTestcases);

        try {
          // some submissions don't have expected output
          const expectedOutput = pageData.match(
            /expected_output\s*:\s*'(.*?)'/
          )[1];
          const codeOutput = pageData.match(/code_output\s*:\s*'(.*?)'/)[1];
          setExpectedOutput(unescapeUtf8(expectedOutput));
          setCodeOutput(unescapeUtf8(codeOutput));
        } catch (e) {
          console.error(e);
        }
      });
  }, [submissionUrl]);

  var outputDiff = null;
  if (expectedOutput && codeOutput) {
    outputDiff = (
      <table>
        <tbody>
          <tr>
            <td className="pr-3">Output:</td>
            <td className="w-full font-menlo text-red-s">{codeOutput}</td>
          </tr>
          <tr>
            <td className="pr-3">Expected:</td>
            <td className="w-full font-menlo text-red-s">{expectedOutput}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <div className="overflow-scroll bg-fill-4 dark:bg-dark-fill-4 mb-4 flex w-full flex-col gap-4 rounded-lg p-4 text-label-2 dark:text-dark-label-2">
      <p>
        {totalCorrect && totalTestcases
          ? `${totalCorrect} / ${totalTestcases} test cases passed.`
          : "Loading..."}
      </p>
      {outputDiff}
    </div>
  );
};

export default SubmissionDetails;

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/*"],
  all_frames: true
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () =>
  document.querySelector(
    String.raw`#qd-content > div.h-full.flex-col.ssg__qd-splitter-secondary-w > div > div.min-h-0.flex-grow > div > div.flex.h-full.w-full.flex-col.overflow-hidden > div.bg-layer-1.dark\:bg-dark-layer-1.flex.h-full.w-full.flex-col.overflow-auto.p-5 > div:nth-child(2)`
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
