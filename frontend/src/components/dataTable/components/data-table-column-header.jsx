import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function DataTableColumnHeader({ column, title, className, initialSort }) {
  useEffect(() => {
    if (initialSort && !column.getIsSorted()) {
      const isDesc = initialSort === "desc";
      column.toggleSorting(isDesc)
    }
  }, [initialSort, column]);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={column.getToggleSortingHandler()}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/70" />
        )}
      </Button>
    </div>
  );
}
