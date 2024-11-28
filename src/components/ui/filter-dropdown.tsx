"use client"

import * as React from "react"
import { SearchX, Tags, X } from 'lucide-react'
import { Button } from "@components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Badge } from "@components/ui/badge"
import { ScrollArea } from "@components/ui/scroll-area"

type FilterOption = {
  value: string
  label: string
}

type FilterDropdownProps = {
  options: FilterOption[]
  placeholder?: string
  emptyMessage?: string
  onChange?: (selectedOptions: FilterOption[]) => void
}

export function FilterDropdown({
  options,
  placeholder = "Select filters...",
  emptyMessage = "No results found.",
  onChange,
}: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValues, setSelectedValues] = React.useState<string[]>([])

  const resetFilters = () => {
    setSelectedValues([])
    onChange?.([])
  }

  const toggleOption = (value: string) => {
    setSelectedValues((current) => {
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]

      if (onChange) {
        const selectedOptions = options.filter((option) =>
          updated.includes(option.value)
        )
        onChange(selectedOptions)
      }

      return updated
    })
  }

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select filters"
          className="w-full justify-between md:w-[200px]"
        >
          <Tags className="mr-2 h-4 w-4" />
          {selectedValues.length > 0 ? (
            <>
              <span className="truncate">
                {selectedValues.length} tag{selectedValues.length > 1 ? "s" : ""}{" "}
                selected
              </span>
              <Badge
                variant="secondary"
                className="ml-2 rounded-full px-1 font-normal"
              >
                {selectedValues.length}
              </Badge>
            </>
          ) : (
            "Select tags"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty className="flex flex-col items-center justify-center py-6">
            <SearchX className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-muted-foreground text-sm">{emptyMessage}</span>
          </CommandEmpty>
          <ScrollArea className="h-[300px]">
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggleOption(option.value)}
                >
                  <div
                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                      selectedValues.includes(option.value)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted"
                    }`}
                  >
                    {selectedValues.includes(option.value) && (
                      <X className="h-3 w-3" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
        {selectedValues.length > 0 && (
          <div className="p-2 bg-muted/50 border-t">
            <div className="mb-2">
              <p className="text-sm font-medium">Selected tags:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs"
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-muted-foreground hover:text-foreground"
              onClick={resetFilters}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

