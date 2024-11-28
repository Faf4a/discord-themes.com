"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";

const filterOptions = [
    {
        value: "most-popular",
        label: "Most Popular"
    },
    {
        value: "most-liked",
        label: "Most Liked"
    },
    {
        value: "recently-updated",
        label: "Recently Updated"
    },
    {
        value: "recently-uploaded",
        label: "Recently Uploaded"
    }
];

export function DropdownFilter({ onChange }: { onChange: (value: string) => void }) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
                    {value ? filterOptions.find((option) => option.value === value)?.label || "Filter by..." : "Filter by..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search filter..." />
                    <CommandEmpty>No filter found.</CommandEmpty>
                    <CommandGroup>
                        {filterOptions.map((option) => (
                            <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={(currentValue) => {
                                    const newValue = currentValue === value ? "" : currentValue;
                                    setValue(newValue);
                                    setOpen(false);
                                    onChange(newValue);
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}