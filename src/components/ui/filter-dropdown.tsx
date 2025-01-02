"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Badge } from "@components/ui/badge"

type FilterOption = {
  value: string
  label: string
}

type FilterDropdownProps = {
  options: FilterOption[]
  // eslint-disable-next-line no-unused-vars
  onChange?: (selectedOptions: FilterOption[]) => void
  className?: string
}

export function FilterDropdown({
  options,
  onChange,
  // eslint-disable-next-line no-unused-vars
  className
}: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValues, setSelectedValues] = React.useState<string[]>([])

  const toggleOption = (value: string) => {
    setSelectedValues((current) => {
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]

      const selectedOptions = options.filter((option) => 
        updated.includes(option.value)
      )
      onChange?.(selectedOptions)
      return updated
    })
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedValues([])
    onChange?.([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select filters"
          className="w-[240px] justify-between"
        >
          <span className="flex items-center gap-2 max-w-full overflow-hidden text-ellipsis">
            {selectedValues.length > 0 ? (
              <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
                {selectedValues.slice(0, 2).map((value) => (
                  <Badge key={value} variant="secondary" className="font-normal truncate text-ellipsis">
                    {value}
                  </Badge>
                ))}
                {selectedValues.length > 2 && (
                  <Badge variant="secondary" className="font-normal">
                    +{selectedValues.length - 2}
                  </Badge>
                )}
              </div>
            ) : (
              "Tags"
            )}
          </span>
        <div className="flex items-center gap-1">
            {selectedValues.length > 0 && (
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
          <CommandInput placeholder="Search filters..." className="h-9" />
          <CommandEmpty className="p-2 text-sm text-gray-500">
            No filters found.
          </CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => toggleOption(option.value)}
                className="flex items-center gap-2 px-2 py-1.5"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-lg border ${
                    selectedValues.includes(option.value)
                      ? "bg-primary border-primary"
                      : "border-muted"
                  }`}>
                    {selectedValues.includes(option.value) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}