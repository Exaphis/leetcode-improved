# LeetCode Improved

A browser extension to improve your LeetCode quality of life. Made with [Plasmo](https://plasmo.com).

## Features

- [x] Automatically retry run code when it fails due to rate limits
- [x] Run one specific test case (useful if other inputted test cases take a long time to run)
- [x] Automatically start the problem timer
- [x] Traditional test case input (instead of one field at a time)
- [x] Show runtime and memory usage in submission list view
- [x] Show number of successful test cases for wrong answer submissions

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
