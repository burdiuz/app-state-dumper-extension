import { AccordionGroup, Box, Button, Input, Typography } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import { useCallback, useEffect, useState } from "react";
import { PanelItem } from "./PanelItem";
import {
  addCustomPanel,
  getCustomPanels,
  removeCustomPanel,
  updateCustomPanel,
} from "extension/panels";
import { getActiveTab } from "extension/utils";
import { useSnackbars } from "shared/Snackbars";

const { chrome } = window;

export const getCurrentlyUsedKeys = (tab) =>
  new Promise((resolve, reject) => {
    function injectedFn() {
      const sortKeys = (keys) =>
        keys.sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
        );

      return {
        localStorage: sortKeys(Object.keys(window.localStorage)),
        sessionStorage: sortKeys(Object.keys(window.sessionStorage)),
        cookies: sortKeys(
          (window.document.cookie || "")
            .split(";")
            .map((str) => str.trim().split("=").shift())
        ),
      };
    }

    chrome.scripting
      ?.executeScript({
        target: { tabId: tab.id },
        func: injectedFn,
      })
      .then(([{ result }]) => resolve(result))
      .catch(reject);
  });

export const CustomPanelsView = ({ onUpdate }) => {
  const [panels, setPanels] = useState([]);
  const { showSnackbar } = useSnackbars();

  const [suggestions, setSuggestions] = useState({
    localStorage: [],
    sessionStorage: [],
    cookies: [],
  });

  const [name, setName] = useState("");

  useEffect(() => {
    getCustomPanels().then(setPanels);
    getActiveTab().then(getCurrentlyUsedKeys).then(setSuggestions);
  }, []);

  const handleAddPanel = useCallback(() => {
    addCustomPanel({
      id: Date.now(),
      name,
      cookies: [],
      localStorage: [],
      sessionStorage: [],
      expiresDays: 0,
      version: Date.now(),
    })
      .then(setPanels)
      .then(onUpdate);

    setName("");
  }, [name, onUpdate]);

  const handleUpdatePanel = useCallback(
    (panel) => {
      updateCustomPanel(panel).then(setPanels).then(onUpdate);
    },
    [onUpdate]
  );

  const handleRemovePanel = useCallback(
    (panel) => {
      removeCustomPanel(panel.id).then(setPanels).then(onUpdate);
      showSnackbar(
        "Please, close and re-open Chrome DevTools to make removed panel disappear from DevTools navigation."
      );
    },
    [onUpdate]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Box sx={{ display: "flex", gap: "8px" }}>
        <Input
          value={name}
          sx={{ flex: 1 }}
          onChange={({ currentTarget: { value } }) => setName(value)}
          placeholder="Specify a new DevTools panel name"
        />{" "}
        <Button disabled={!name.trim()} onClick={handleAddPanel}>
          <AddIcon /> <Typography>Create New Panel</Typography>
        </Button>
      </Box>
      <AccordionGroup>
        {panels.map((item) => (
          <PanelItem
            key={item.id}
            panel={item}
            suggestions={suggestions}
            onUpdate={handleUpdatePanel}
            onRemove={handleRemovePanel}
          />
        ))}
      </AccordionGroup>
    </Box>
  );
};
