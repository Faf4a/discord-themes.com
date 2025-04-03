"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Badge } from "@components/ui/badge"
import { cn } from "@lib/utils"

type FilterOption = {
  value: string
  label: string
  count?: number
}

type FilterDropdownProps = {
  options: FilterOption[]
  onChange?: (selectedOptions: FilterOption[]) => void
  className?: string
  label?: string
}

export function FilterDropdown({ options, onChange, className, label = "Filter" }: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValues, setSelectedValues] = React.useState<string[]>([])

  const toggleOption = (value: string) => {
    setSelectedValues((current) => {
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]

      const selectedOptions = options.filter((option) => updated.includes(option.value))
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
          aria-label={`Select ${label.toLowerCase()}`}
          className={cn("justify-between", className)}
        >
          <span className="flex items-center gap-2 max-w-full overflow-hidden text-ellipsis">
            {selectedValues.length > 0 ? (
              <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
                {selectedValues.slice(0, 2).map((value) => {
                  const option = options.find((opt) => opt.value === value)
                  return (
                    <Badge key={value} variant="secondary" className="font-normal truncate text-ellipsis">
                      {option?.label || value}
                    </Badge>
                  )
                })}
                {selectedValues.length > 2 && (
                  <Badge variant="secondary" className="font-normal">
                    +{selectedValues.length - 2}
                  </Badge>
                )}
              </div>
            ) : (
              label
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
      <PopoverContent className={cn("p-0", className)}>
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className="h-9" autoFocus={false} />
          <CommandList>
            <CommandEmpty className="p-2 text-sm text-gray-500">No {label.toLowerCase()} found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => toggleOption(option.value)}
                  className="flex items-center gap-2 px-2 py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                        selectedValues.includes(option.value) ? "bg-primary border-primary" : "border-muted"
                      }`}
                    >
                      {selectedValues.includes(option.value) && (
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground ml-2">{option.count}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}