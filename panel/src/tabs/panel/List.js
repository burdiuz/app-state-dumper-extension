import Box from "@mui/joy/Box";
import Table from "@mui/joy/Table";
import { ListItem } from "./ListItem";
import { NewItem } from "./NewItem";

export const List = ({
  panel,
  dumps,
  onDump,
  onEdit,
  onRemove,
  onApply,
  onReplace,
  sx,
}) => {
  return (
    <Box sx={sx}>
      <NewItem onDump={onDump} />
      <Table>
        <thead>
          <tr>
            <th style={{ width: "60px" }}></th>
            <th style={{ width: "45px" }}></th>
            <th>Description / Host</th>
            <th style={{ width: "80px" }}>Date</th>
            <th style={{ width: "65px" }}></th>
          </tr>
        </thead>
        <tbody>
          {dumps.map((item) => (
            <ListItem
              key={item.id}
              item={item}
              panel={panel}
              onEdit={onEdit}
              onRemove={onRemove}
              onApply={onApply}
              onReplace={onReplace}
            />
          ))}
        </tbody>
      </Table>
    </Box>
  );
};
