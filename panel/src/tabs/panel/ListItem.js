import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Checkbox from "@mui/joy/Checkbox";
import { useState } from "react";
import { CopyToClipboardButton } from "shared/CopyToClipboardButton";
import Report from "@mui/icons-material/Report";

/**
 *
 * @param {number} timestamp
 * @returns
 */
const toDateString = (timestamp) => new Date(timestamp).toLocaleString();

const labelColor = (value) => ({
  color: value ? "inherit" : "var(--joy-palette-neutral-plainDisabledColor)",
});

export const ListItem = ({ panel, item, onEdit, onRemove, onApply }) => {
  const { id, name, description, date, panelVersion } = item;

  return (
    <tr>
      <td>
        <Button title="Edit dump contents" onClick={() => onApply(item)}>
          Apply
        </Button>
      </td>
      <td>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <Button
            variant="soft"
            title="Edit dump contents"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <ModeEditIcon />
          </Button>
          <CopyToClipboardButton
            value={item}
            message="State dump copied to clipboard."
            title="Copy dump contents into clipboard"
            variant="soft"
            size="sm"
          />
        </Box>
      </td>
      <td>
        {description && <div>{description}</div>}
        {panel.version > panelVersion ? (
          <span title="Panel configuration has been updated since the item was stored.">
            <Report
              color="danger"
              sx={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                verticalAlign: "middle",
                marginRight: "8px",
              }}
            />
          </span>
        ) : null}
        {name}
      </td>
      <td>{toDateString(date)}</td>
      <td>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Button
            variant="soft"
            color="danger"
            title="Delete app state dump"
            onClick={() => onRemove(id)}
          >
            Delete
          </Button>
        </Box>
      </td>
    </tr>
  );
};
