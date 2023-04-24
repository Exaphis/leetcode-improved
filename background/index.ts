export {};

function toInject() {
  // override the fetch function to allow us to intercept requests to the
  // LeetCode API and modify them to only run a single test case
  if ((window as any).lciFetch) return;

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const testCaseNum = parseInt(
      document.body.getAttribute("data-test-case-num")
    );
    const numTestCases = parseInt(
      document.body.getAttribute("data-num-test-cases")
    );

    const isRunThisTest =
      !Number.isNaN(testCaseNum) && !Number.isNaN(numTestCases);

    if (isRunThisTest && (args[0] as String)?.endsWith("interpret_solution/")) {
      let body_str = args[1]?.body?.toString();
      const body = JSON.parse(body_str);
      const input_lines = body.data_input.split("\n");
      const num_lines = input_lines.length;

      const num_lines_per_test_case = Math.floor(num_lines / numTestCases);
      const start = (testCaseNum - 1) * num_lines_per_test_case;
      const end = start + num_lines_per_test_case;

      body.data_input = input_lines.slice(start, end).join("\n");
      args[1].body = JSON.stringify(body);
    }

    let resp = await originalFetch.apply(this, args);
    if (isRunThisTest && (args[0] as String)?.endsWith("check/")) {
      const body = await resp.clone().json();
      if (body?.status_code === 10) {
        let code_answer = Array(numTestCases).fill("");
        let expected_code_answer = Array(numTestCases).fill("");
        code_answer[testCaseNum - 1] = body.code_answer[0];
        expected_code_answer[testCaseNum - 1] = body.expected_code_answer[0];

        // for some reason the responses from LeetCode have an extra entry
        let code_output = Array(numTestCases + 1).fill("");
        let std_output = Array(numTestCases + 1).fill("");
        code_output[testCaseNum - 1] = body.code_output[0];
        std_output[testCaseNum - 1] = body.std_output[0];

        document.body.removeAttribute("data-test-case-num");
        document.body.removeAttribute("data-num-test-cases");
        return new Response(
          JSON.stringify({
            ...body,
            code_answer,
            expected_code_answer,
            code_output,
            std_output,
            total_correct: body.total_correct + numTestCases - 1,
            total_testcases: numTestCases,
            compare_result: body.compare_result.repeat(numTestCases)
          })
        );
      }
    }
    return resp;
  };
  (window as any).lciFetch = true;

  // add a listener to allow the content script to get the react props
  // of a given element
  function getReact(element) {
    // https://stackoverflow.com/a/39165137/6686559
    const key = Object.keys(element).find((key) =>
      key.startsWith("__reactFiber$")
    );
    const domFiber = element[key];
    if (domFiber == null) return null;

    let parentFiber = domFiber.return;
    while (typeof parentFiber.type == "string") {
      parentFiber = parentFiber.return;
    }
    return parentFiber;
  }

  window.addEventListener("message", (event) => {
    if (event.data.source === "lci-cs-get-react-props") {
      const el = document.querySelector(event.data.selector);
      const reactEl = getReact(el);
      window.postMessage({
        source: "lci-bg-get-react-props",
        selector: event.data.selector,
        reactProps: reactEl.memoizedProps
      });
    }
  });
}

chrome.tabs.onUpdated.addListener(async (tab) => {
  try {
    await chrome.scripting.executeScript({
      target: {
        tabId: tab
      },
      world: "MAIN",
      func: toInject
    });
  } catch (e) {
    // ignore errors due to the tab not matching what we have in the manifest
    console.log(e);
  }
});
