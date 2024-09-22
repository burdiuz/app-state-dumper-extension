const { chrome, localStorage } = window;

export const getStorage = () => chrome.storage?.local;

export const getStorageItem = async (key) => {
  if (chrome.storage) {
    return chrome.storage.local.get().then((data) => data[key]);
  }

  const str = localStorage.getItem(key);

  if (!str) return str;

  return JSON.parse(str);
};

export const setStorageItem = async (key, value) => {
  if (chrome.storage) {
    return chrome.storage.local
      .get()
      .then((data) => chrome.storage.local.set({ ...data, [key]: value }));
  }

  localStorage.setItem(key, JSON.stringify(value));
};

export const removeStorageItem = async (key) => {
  if (chrome.storage) {
    chrome.storage.local.get().then((data) => {
      delete data[key];

      return chrome.storage.local.set(data);
    });
  }

  localStorage.removeItem(key);
};
