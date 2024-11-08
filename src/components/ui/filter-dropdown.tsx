"use client";

import * as React from "react";
import { Filter, SearchX, X } from "lucide-react";
import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Badge } from "@components/ui/badge";

type FilterOption = {
    value: string;
    label: string;
};

type FilterDropdownProps = {
    options: FilterOption[];
    placeholder?: string;
    emptyMessage?: string;
    onChange?: (selectedOptions: FilterOption[]) => void;
};

export function FilterDropdown({ options, placeholder = "Select filters...", emptyMessage = "No results found.", onChange }: FilterDropdownProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

    const resetFilters = () => {
        setSelectedValues([]);
        onChange?.([]);
    };

    const toggleOption = (value: string) => {
        setSelectedValues((current) => {
            const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

            if (onChange) {
                const selectedOptions = options.filter((option) => updated.includes(option.value));
                onChange(selectedOptions);
            }

            return updated;
        });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start relative">
                    <Filter className="mr-2 h-4 w-4" />
                    {selectedValues.length > 0 ? (
                        <>
                            Filters
                            <Badge variant="secondary" className="ml-2 rounded-lg px-1 font-normal">
                                {selectedValues.length}
                            </Badge>
                            {!open && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 ml-2 hover:bg-muted"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        resetFilters();
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </>
                    ) : (
                        "Filters"
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 border border-muted shadow-md" align="start">
                <Command className="border-muted border rounded-lg">
                    <CommandInput placeholder={placeholder} />
                    <CommandEmpty className="flex flex-col items-center justify-center py-6">
                        <SearchX className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-muted-foreground text-sm">{emptyMessage}</span>
                    </CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-muted hover:scrollbar-thumb-muted-foreground/30">
                        {options.map((option) => (
                            <CommandItem key={option.value} onSelect={() => toggleOption(option.value)} className="hover:bg-muted">
                                <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-lg border border-muted ${selectedValues.includes(option.value) ? "bg-primary text-primary-foreground" : "opacity-50 hover:opacity-100 hover:[&_svg]:visible"}`}>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    {selectedValues.length > 0 && (
                        <div className="p-2 bg-muted/50 border-none">
                            <Button variant="ghost" size="sm" className="w-full justify-center text-muted-foreground hover:text-foreground" onClick={resetFilters}>
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
