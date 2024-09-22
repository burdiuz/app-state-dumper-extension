import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Checkbox from "@mui/joy/Checkbox";
import { useState } from "react";

export const NewItem = ({ onDump }) => {
  const [newDescription, setNewDescription] = useState("");

  return (
    <Box
      sx={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <Input
        placeholder="Optional description of dumped items"
        sx={{ flex: 1 }}
        value={newDescription}
        onChange={({ currentTarget: { value } }) => setNewDescription(value)}
      />
      <Button
        onClick={() => {
          onDump({
            description: newDescription,
          });
          setNewDescription("");
        }}
      >
        Dump
      </Button>
    </Box>
  );
};
