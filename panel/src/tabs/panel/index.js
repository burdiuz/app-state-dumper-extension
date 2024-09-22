import { useCallback, useEffect, useState } from "react";
import { List } from "./List";
import { getActiveTab, getTabRootUrl } from "extension/utils";
import { useSnackbars } from "shared/Snackbars";
import { AppDumpEditor } from "tabs/app-dump/AppDumpEditor";
import {
  getCustomPanelDumps,
  removeCustomPanelDump,
  setCustomPanelDumps,
  updateCustomPanelDump,
} from "extension/panels";

const { chrome } = window;

export const dumpAppState = (tab, panel) =>
  new Promise((resolve, reject) => {
    function injectedFn(lsKeys, ssKeys, cookieKeys) {
      let cookieObj = {};

      if (cookieKeys.length) {
        cookieObj = (window.document.cookie || "")
          .split(";")
          .reduce((res, str) => {
            const [key, value] = str.trim().split("=");

            return {
              ...res,
              [key]: value,
            };
          }, {});
      }

      return {
        localStorage: lsKeys.reduce((res, key) => {
          return {
            ...res,
            [key]: window.localStorage.getItem(key),
          };
        }, {}),
        sessionStorage: ssKeys.reduce((res, key) => {
          return {
            ...res,
            [key]: window.sessionStorage.getItem(key),
          };
        }, {}),
        cookies: cookieKeys.reduce((res, key) => {
          return {
            ...res,
            [key]: cookieObj[key] || null,
          };
        }, {}),
      };
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: injectedFn,
        args: [panel.localStorage, panel.sessionStorage, panel.cookies],
      })
      .then(([{ result }]) => resolve(result))
      .catch(reject);
  });

export const applyAppState = (tab, item) =>
  new Promise((resolve, reject) => {
    function injectedFn(item) {
      Object.entries(item.localStorage).forEach(([key, value]) =>
        value === null
          ? window.localStorage.removeItem(key)
          : window.localStorage.setItem(key, value)
      );

      Object.entries(item.sessionStorage).forEach(([key, value]) =>
        value === null
          ? window.sessionStorage.removeItem(key)
          : window.sessionStorage.setItem(key, value)
      );

      Object.entries(item.cookies).forEach(([key, value]) => {
        const { document } = window;
        const domain = `;domain=${
          item.cookieDomain || `.${window.location.host}`
        }`;
        const maxAge = item.cookieMaxAge ? `;max-age=${item.cookieMaxAge}` : "";
        const expires = item.cookieExpirationDate
          ? `;expires=${item.cookieExpirationDate}`
          : "";
        const path = `;path=${item.cookiePath || "/"}`;
        const secure = item.cookieSecure ? ";secure" : "";

        if (value === null) {
          const { document } = window;
          const hosts = [window.location.host, `.${window.location.host}`];
          const paths = ["/", window.location.pathname];
          const base = `${key}=;expires=${new Date(
            2000
          ).toUTCString()};max-age=-1`;

          hosts.forEach((host) => {
            paths.forEach((path) => {
              const str = `${base};path=${path};domain=${host}`;
              document.cookie = str;
              document.cookie = `${str};secure`;
            });
          });
          return;
        }

        document.cookie = `${key}=${value}${domain}${path}${maxAge}${expires}${secure}`;
      });
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: injectedFn,
        args: [item],
      })
      .then(([{ result }]) => resolve(result))
      .catch(reject);
  });


  // TODO Reload page on apply
  // Redirect To on apply
export const PanelView = ({ panel, sx }) => {
  const [list, setList] = useState([]);
  const [editedItem, setEditedItem] = useState(null);
  const { showSnackbar } = useSnackbars();

  const handleDump = useCallback(
    async (item) => {
      const { description } = item;
      const tab = await getActiveTab();
      const storages = await dumpAppState(tab, panel);
      const host = getTabRootUrl(tab);
      const date = Date.now();
      let list = await getCustomPanelDumps(panel.id, panel.expiresDays);
      list = await setCustomPanelDumps(panel.id, [
        {
          ...storages,
          id: date,
          name: host,
          description,
          cookieMaxAge: "",
          cookieExpirationDate: "",
          cookiePath: "/",
          cookieDomain: "",
          cookieSecure: true,
          panelVersion: panel.version,
          date,
        },
        ...list,
      ]);

      setList(list);
    },
    [panel]
  );

  const handleEdit = useCallback((item) => {
    setEditedItem(item);
  }, []);

  const handleRemove = useCallback(async (id) => {
    const list = await removeCustomPanelDump(panel.id, id);

    setList(list);
  }, []);

  const handleApply = useCallback(async (item) => {
    const tab = await getActiveTab();
    await applyAppState(tab, item);
    showSnackbar("Application state has been updated.");
  }, []);

  const handleEditorSave = useCallback(
    async (updatedItem) => {
      let list = await getCustomPanelDumps(panel.id, panel.expiresDays);
      list = await updateCustomPanelDump(panel.id, updatedItem);

      setList(list);
      setEditedItem(null);
    },
    [panel]
  );

  const handleEditorClose = useCallback(() => {
    setEditedItem(null);
  }, []);

  useEffect(() => {
    getCustomPanelDumps(panel.id, panel.expiresDays).then(setList);
  }, []);

  return editedItem ? (
    <AppDumpEditor
      value={editedItem}
      onSave={handleEditorSave}
      onClose={handleEditorClose}
    />
  ) : (
    <List
      dumps={list}
      panel={panel}
      onDump={handleDump}
      onEdit={handleEdit}
      onRemove={handleRemove}
      onApply={handleApply}
      sx={sx}
    />
  );
};
