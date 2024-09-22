const { chrome } = window;

export const getActiveTab = () =>
  new Promise((resolve, reject) => {
    const tabId = chrome.devtools.inspectedWindow.tabId;

    if (!tabId) {
      reject(`Tab with id "${tabId}" could not be found.`);
    }

    chrome.tabs.get(tabId).then(resolve).catch(reject);
  });

export const getTabRootUrl = (tab) => {
  const url = new URL(tab.url);
  url.hash = "";
  url.search = "";
  url.pathname = "/";

  const str = url.toString();

  return str.substring(0, str.length - 1);
};
