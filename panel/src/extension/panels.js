import { getStorageItem, removeStorageItem, setStorageItem } from "./storage";

const DUMP_STORAGE_KEY = "ce-custom-panel-dump";

const getKeyFor = (panelId) => `${DUMP_STORAGE_KEY}:${panelId}`;

export const getCustomPanelDumps = async (panelId, daysToExpire = 0) => {
  const expirationDate = daysToExpire
    ? Date.now() - daysToExpire * 86400000
    : 0;

  const list = await getStorageItem(getKeyFor(panelId)).then(
    (list) => list || []
  );

  if (!expirationDate) {
    return list;
  }

  return list.filter(({ date }) => date > expirationDate);
};

export const setCustomPanelDumps = async (panelId, list) => {
  await setStorageItem(getKeyFor(panelId), list || []);

  return getCustomPanelDumps(panelId);
};
export const removeCustomPanelDumps = async (panelId) =>
  removeStorageItem(getKeyFor(panelId));

export const addCustomPanelDump = async (panelId, dump) => {
  const list = await getCustomPanelDumps(panelId);

  return setCustomPanelDumps(panelId, [dump, ...list]);
};

export const updateCustomPanelDump = async (panelId, dump) => {
  const list = await getCustomPanelDumps(panelId);

  return setCustomPanelDumps(
    panelId,
    list.map((item) => {
      if (item.id !== dump.id) {
        return item;
      }

      return dump;
    })
  );
};

export const removeCustomPanelDump = async (panelId, dumpId) => {
  const list = await getCustomPanelDumps(panelId);

  return setCustomPanelDumps(list.filter((item) => item.id !== dumpId));
};

const PANELS_STORAGE_KEY = "ce-custom-panels";

const sortPanels = (list) =>
  [...list].sort(({ name: a }, { name: b }) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );

export const getCustomPanels = () =>
  getStorageItem(PANELS_STORAGE_KEY).then((list) => list || []);

export const setCustomPanels = async (list) => {
  await setStorageItem(PANELS_STORAGE_KEY, list);

  return getCustomPanels();
};

export const getCustomPanel = (panelId) =>
  getCustomPanels().then((list) => list.find((item) => item.id === panelId));

export const addCustomPanel = async (panel) => {
  const list = await getCustomPanels();

  return setCustomPanels(sortPanels([panel, ...list]));
};

export const updateCustomPanel = async (panel) => {
  const list = await getCustomPanels();

  return setCustomPanels(
    list.map((item) => {
      if (item.id !== panel.id) {
        return item;
      }

      return panel;
    })
  );
};

export const removeCustomPanel = async (panelId) => {
  const list = await getCustomPanels();

  removeCustomPanelDumps(panelId);

  return setCustomPanels(list.filter((item) => item.id !== panelId));
};
