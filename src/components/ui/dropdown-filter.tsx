"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Label } from "@components/ui/label";
import { Badge } from "@components/ui/badge";

const filterOptions = [
    { value: "most-popular", label: "Most Popular", description: "Sort by number of views" },
    { value: "most-liked", label: "Most Liked", description: "Sort by number of likes" },
    { value: "recently-updated", label: "Recently Updated", description: "Sort by last update date" },
    { value: "recently-uploaded", label: "Recently Uploaded", description: "Sort by upload date" }
];

export function DropdownFilter({ 
    onChange, 
    className 
}: { 
    onChange: (value: string) => void;
    className?: string;
}) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setValue("");
        onChange("");
        setSearchQuery("");
    };

    const selectedOption = filterOptions.find((option) => option.value === value);

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="filter-dropdown"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Sort by"
                        className="w-[240px] justify-between hover:bg-muted"
                    >
                        <span className="flex items-center gap-2 truncate">
                            {value ? (
                                <>
                                    <Badge variant="secondary" className="font-normal">
                                        {selectedOption?.label}
                                    </Badge>
                                </>
                            ) : (
                                "Sort by..."
                            )}
                        </span>
                        <div className="flex items-center gap-1">
                            {value && (
                                <X
                                    className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                                    onClick={handleClear}
                                    aria-label="Clear selection"
                                />
                            )}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0">
                    <Command>
                        <CommandInput 
                            placeholder="Search filters..." 
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            className="h-9"
                        />
                        <CommandEmpty className="p-2 text-sm text-gray-500">
                            No filters found.
                        </CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-y-auto">
                            {filterOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        const newValue = currentValue === value ? "" : currentValue;
                                        setValue(newValue);
                                        setOpen(false);
                                        onChange(newValue);
                                        setSearchQuery("");
                                    }}
                                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <Check 
                                            className={cn(
                                                "h-4 w-4 flex-shrink-0",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )} 
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{option.label}</span>
                                            <span className="text-xs text-gray-500">{option.description}</span>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default DropdownFilter;