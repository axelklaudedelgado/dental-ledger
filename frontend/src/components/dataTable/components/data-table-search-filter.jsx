import { InputWithClear } from "../../ui/extensions/input-with-clear";

export function Search ({ table, ...props }) {
  const filterValue = table.getState().globalFilter || "";

  return (
    <InputWithClear
      value={filterValue}
      onChange={event => table.setGlobalFilter(String(event.target.value))}
      className="max-w-sm"
      {...props}
    />
  );
}
