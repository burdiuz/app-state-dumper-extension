import "./App.css";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tab from "@mui/joy/Tab";
import "@fontsource/inter";
import { AppDumpView } from "./tabs/app-dump";
import SettingsIcon from "@mui/icons-material/Settings";
import { SnackbarsProvider } from "shared/Snackbars";
import { ConfigurationView } from "tabs/configuration";
import { CustomPanelsView } from "tabs/custom-panels";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCustomPanel, getCustomPanels } from "extension/panels";
import { PanelView } from "tabs/panel";
import { Box, Typography } from "@mui/joy";

const { chrome } = window;

const TabKeys = {
  APP_DUMP: "app-state-dump",
  CUSTOM_PANELS: "custom-panels",
  CONFIGURATION: "configuration",
};

const getPanelKey = (id) => `panel-${id}`;

const AppTabs = () => {
  const map = useMemo(() => new Map());
  const [panels, setPanels] = useState([]);

  const handlePanelsUpdate = useCallback(async () => {
    const list = await getCustomPanels();
    setPanels(list);

    list.forEach((panel) => {
      if (map.has(panel.id)) {
        return;
      }

      chrome.devtools?.panels.create(
        panel.name,
        "",
        `panel/index.html#${panel.id}`,
        function (devToolsPanel) {
          map.set(panel.id, devToolsPanel);
        }
      );
    });
  }, []);

  useEffect(() => {
    handlePanelsUpdate();
  }, []);

  return (
    <Tabs defaultValue={TabKeys.APP_DUMP}>
      <TabList
        sx={{
          overflow: "auto",
          scrollSnapType: "x mandatory",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Tab
          value={TabKeys.APP_DUMP}
          sx={{ flex: "none", scrollSnapAlign: "start" }}
        >
          State Dump
        </Tab>
        <Tab
          value={TabKeys.CUSTOM_PANELS}
          sx={{ flex: "none", scrollSnapAlign: "start" }}
        >
          Custom Panels
        </Tab>
        <Tab
          value={TabKeys.CONFIGURATION}
          sx={{ flex: "none", scrollSnapAlign: "start" }}
        >
          <SettingsIcon />
        </Tab>
        {panels.map((panel) => {
          const id = getPanelKey(panel.id);

          return (
            <Tab
              key={id}
              value={id}
              sx={{ flex: "none", scrollSnapAlign: "start" }}
            >
              {panel.name}
            </Tab>
          );
        })}
      </TabList>
      <TabPanel value={TabKeys.APP_DUMP}>
        <AppDumpView />
      </TabPanel>
      <TabPanel value={TabKeys.CUSTOM_PANELS}>
        <CustomPanelsView onUpdate={handlePanelsUpdate} />
      </TabPanel>
      <TabPanel value={TabKeys.CONFIGURATION}>
        <ConfigurationView />
      </TabPanel>
      {panels.map((panel) => {
        const id = getPanelKey(panel.id);
        return (
          <TabPanel key={id} value={id}>
            <PanelView panel={panel} />
          </TabPanel>
        );
      })}
    </Tabs>
  );
};

const PANEL_ID = Number(window.location.hash.substr(1));

const NoPanelView = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "600px",
    }}
  >
    <Typography>
      Sorry, this Panel probably was removed earlier or we have issues loading
      its configuration. Please, close and re-open Chrome DevTools to make it
      disappear.
    </Typography>
  </Box>
);

function App() {
  const [panel, setPanel] = useState(null);

  useEffect(() => {
    if (!PANEL_ID) {
      return;
    }

    getCustomPanel(PANEL_ID).then(setPanel);
  });
  return (
    <CssVarsProvider>
      <CssBaseline />
      <div className="App">
        <SnackbarsProvider>
          {PANEL_ID ? (
            panel ? (
              <PanelView panel={panel} sx={{ margin: "8px 8px 0 8px " }} />
            ) : (
              <NoPanelView />
            )
          ) : (
            <AppTabs />
          )}
        </SnackbarsProvider>
      </div>
    </CssVarsProvider>
  );
}

export default App;
