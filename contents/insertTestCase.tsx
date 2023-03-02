import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIMountState,
  PlasmoGetInlineAnchor
} from "plasmo";
import { useRef } from "react";

const CustomField = () => {
  const inputRef = useRef<HTMLDivElement>(null);
  const variableFields = document.querySelectorAll<HTMLElement>(
    String.raw`#qd-content > div.h-full.flex-col.ssg__qd-splitter-secondary-w > div > div:nth-child(3) > div > div > div.flex.flex-grow.overflow-y-auto > div > div > div > div.space-y-4 > div > div > div.w-full.cursor-text.rounded-lg.border.px-3.py-\[10px\].font-menlo.bg-fill-3.dark\:bg-dark-fill-3.border-transparent > div`
  );

  if (variableFields.length <= 1) {
    return null;
  }

  function insertTextAtCursor(text: string) {
    // https://htmldom.dev/paste-as-plain-text/
    const range = document.getSelection().getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.selectNodeContents(textNode);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function onClick() {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const inputText = input.innerText;
    const inputLines = inputText.split("\n");
    for (
      let i = 0;
      i < Math.min(inputLines.length, variableFields.length);
      i++
    ) {
      const inputLine = inputLines[i];
      const variableField = variableFields[i];

      // https://stackoverflow.com/a/31056122/6686559
      // in addition to setting the inner text, we need to send an onChange event
      // in order for the input to persist
      variableField.innerText = inputLine;
      let e = new Event("input", { bubbles: true });
      variableField.dispatchEvent(e);

      // for some reason this is necessary when multiple fields are being set,
      // otherwise some fields will go back to their original values
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <div className="flex h-full w-full flex-col space-y-2">
        <div className="text-xs font-medium text-label-3 dark:text-dark-label-3">
          Multiline input
        </div>
        <div className="w-full cursor-text rounded-lg border px-3 py-[10px] font-menlo bg-fill-3 dark:bg-dark-fill-3 border-transparent">
          <div
            className="w-full resize-none whitespace-pre-wrap break-words font-menlo outline-none placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask"
            placeholder="Enter each variable on a new line"
            autoCorrect="off"
            autoCapitalize="off"
            aria-autocomplete="none"
            contentEditable="true"
            ref={inputRef}
            onPaste={(e) => {
              e.preventDefault();

              const text = e.clipboardData?.getData("text/plain");
              insertTextAtCursor(text ?? "");
            }}></div>
        </div>
      </div>
      <div>
        <button
          onClick={onClick}
          className="px-3 py-1.5 font-medium items-center whitespace-nowrap transition-all focus:outline-none inline-flex bg-fill-3 dark:bg-dark-fill-3 hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-label-2 dark:text-dark-label-2 rounded-lg">
          Apply
        </button>
      </div>
    </div>
  );
};

export default CustomField;

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/*"],
  all_frames: true
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () =>
  document.querySelector("#lci-runThisTest");

// override getRootContainer in order to inherit site styles
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
