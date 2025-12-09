import * as React from "react";
import { X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export function MultiSelect({
  options,
  selected,
  onSelectedChange,
  placeholder = "Select items..."
}) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item) => {
    onSelectedChange(selected.filter((s) => s !== item));
  };

  const handleSelect = (value) => {
    if (selected.includes(value)) {
      onSelectedChange(selected.filter((s) => s !== value));
    } else {
      onSelectedChange([...selected, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 h-9"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.length === 0 ? (
              <span className="text-slate-500 dark:text-slate-400 text-sm">{placeholder}</span>
            ) : (
              selected.map((item) => {
                const option = options.find((o) => o.value === item);
                return (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 text-xs"
                  >
                    {option?.label || item}
                    <button
                      className="ml-1 rounded-full outline-none"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(item);
                      }}
                    >
                      <X className="h-3 w-3 text-white hover:text-slate-200" />
                    </button>
                  </Badge>
                );
              })
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600" align="start">
        <div className="max-h-64 overflow-auto p-2">
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer"
                onClick={() => handleSelect(option.value)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleSelect(option.value)}
                  className="border-slate-400 dark:border-slate-500"
                />
                <label className="text-slate-900 dark:text-slate-200 cursor-pointer flex-1 text-sm">
                  {option.label}
                </label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}