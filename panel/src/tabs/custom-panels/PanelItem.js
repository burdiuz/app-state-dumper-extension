import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Card,
  Input,
  Stack,
  Typography,
} from "@mui/joy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useState } from "react";
import { sortKeys } from "./utils";

const KeyList = ({ list, onRemove }) => (
  <>
    {list.map((key) => (
      <Box
        sx={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          bgcolor: "primary.main",
          "&:nth-child(even)": {
            backgroundColor: "var(--joy-palette-neutral-800)",
          },
        }}
      >
        <Button variant="plain" color="danger" onClick={() => onRemove(key)}>
          <DeleteOutlineIcon />
        </Button>
        <Typography sx={{ flex: 1 }}>{key}</Typography>
      </Box>
    ))}
  </>
);

const StorageCard = ({ title, placeholder, suggestions, list, onUpdate }) => {
  const [newKey, setNewKey] = useState("");

  return (
    <Card>
      <Typography level="title-md">{title}</Typography>
      <Box sx={{ display: "flex", gap: "8px" }}>
        <Autocomplete
          options={suggestions}
          freeSolo
          onChange={(obj, str) => setNewKey(str)}
          placeholder={placeholder}
          sx={{ flex: 1 }}
        />
        <Button
          disabled={!newKey || list.includes(newKey)}
          onClick={() => {
            onUpdate(sortKeys([...list, newKey]));
            setNewKey("");
          }}
        >
          Add
        </Button>
      </Box>
      <KeyList
        list={list}
        onRemove={(key) => onUpdate(list.filter((item) => item !== key))}
      />
    </Card>
  );
};

export const PanelItem = ({ panel, onUpdate, onRemove, suggestions }) => {
  return (
    <Accordion>
      <AccordionSummary>
        <Typography level="title-lg">{panel.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2} sx={{ gap: "8px" }}>
          <StorageCard
            list={panel.localStorage}
            suggestions={suggestions.localStorage}
            onUpdate={(list) =>
              onUpdate({
                ...panel,
                localStorage: list,
                version: Date.now(),
              })
            }
            title="Local Storage keys to store"
            placeholder="Provide a Local Storage key to add to new dumps."
          />
          <StorageCard
            list={panel.sessionStorage}
            suggestions={suggestions.sessionStorage}
            onUpdate={(list) =>
              onUpdate({
                ...panel,
                sessionStorage: list,
                version: Date.now(),
              })
            }
            title="Session Storage keys to store"
            placeholder="Provide a Session Storage key to add to new dumps."
          />
          <StorageCard
            list={panel.cookies}
            suggestions={suggestions.cookies}
            onUpdate={(list) =>
              onUpdate({
                ...panel,
                cookies: list,
                version: Date.now(),
              })
            }
            title="Cookies to store"
            placeholder="Provide a Cookie name to add to new dumps."
          />
        </Stack>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          <Input
            value={panel.expiresDays ? panel.expiresDays : ""}
            type="number"
            placeholder="days"
            onChange={({ currentTarget: { value } }) => {
              const num = Number(value);

              onUpdate({
                ...panel,
                expiresDays: Number.isNaN(num) || !num ? 0 : num,
              });
            }}
            sx={{ width: "70px" }}
          />{" "}
          <Typography>Expiration time for stored items</Typography>
          <Button
            color="danger"
            sx={{ marginLeft: "auto" }}
            onClick={() => onRemove(panel)}
          >
            Remove "{panel.name}" panel
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
