import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function DataTableColumnHeader({ column, title, className }) {
  const handleSortToggle = () => {
    const currentSort = column.getIsSorted();

    if (currentSort === "asc") {
      column.toggleSorting(true); 
    } else if (currentSort === "desc") {
      column.clearSorting(); 
    } else {
      column.toggleSorting(false); 
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={handleSortToggle}
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
