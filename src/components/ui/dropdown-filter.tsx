"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Badge } from "@components/ui/badge"
import { VisuallyHidden } from "@components/ui/visually-hidden"

type FilterOption = {
  value: string
  label: string
  description: string
}

const filterOptions: FilterOption[] = [
  { value: "most-popular", label: "Most Popular", description: "Sort by number of views" },
  { value: "most-liked", label: "Most Liked", description: "Sort by number of likes" },
  { value: "recently-updated", label: "Recently Updated", description: "Sort by last update date" },
  { value: "recently-uploaded", label: "Recently Uploaded", description: "Sort by upload date" },
]

interface DropdownFilterProps {
  onChange: (value: string) => void
  className?: string
  defaultValue?: string
  label?: string
}

export function DropdownFilter({ onChange, className, defaultValue = "", label = "Sort by" }: DropdownFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)
  const [searchQuery, setSearchQuery] = React.useState("")
  const commandRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const selectedOption = filterOptions.find((option) => option.value === value)
  const filterId = React.useId()

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setValue("")
    onChange("")
    setSearchQuery("")
    // Announce to screen readers that the selection has been cleared
    const announcement = document.getElementById(`${filterId}-announcement`)
    if (announcement) {
      announcement.textContent = "Selection cleared"
    }
    // Return focus to trigger button
    triggerRef.current?.focus()
  }

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue
    setValue(newValue)
    setOpen(false)
    onChange(newValue)
    setSearchQuery("")

    // Announce selection change to screen readers
    const selectedLabel = filterOptions.find((option) => option.value === newValue)?.label || "No selection"
    const announcement = document.getElementById(`${filterId}-announcement`)
    if (announcement) {
      announcement.textContent = newValue ? `Selected: ${selectedLabel}` : "Selection cleared"
    }
  }

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Visually hidden live region for screen reader announcements */}
      <div id={`${filterId}-announcement`} aria-live="polite" className="sr-only" />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            id={`${filterId}-trigger`}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={`${filterId}-listbox`}
            aria-label={label}
            aria-describedby={`${filterId}-description`}
            className="w-full sm:w-[240px] justify-between hover:bg-muted focus-visible:ring-2 focus-visible:ring-offset-2 min-h-[44px] touch-manipulation"
          >
            <span className="flex items-center gap-2 truncate">
              {value ? (
                <>
                  <Badge variant="secondary" className="font-normal">
                    {selectedOption?.label}
                  </Badge>
                </>
              ) : (
                label
              )}
            </span>
            <div className="flex items-center gap-1">
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={handleClear}
                  aria-label="Clear selection"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full sm:w-[240px] p-0"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => {
            // Focus the search input when opened
            e.preventDefault()
            commandRef.current?.querySelector("input")?.focus()
          }}
        >
          <Command ref={commandRef}>
            <CommandInput
              placeholder="Search filters..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-10"
              aria-label="Search filters"
            />
            <CommandList>
              <CommandEmpty className="p-4 text-sm text-muted-foreground">No filters found.</CommandEmpty>
              <CommandGroup
                className="max-h-[300px] overflow-y-auto"
                aria-labelledby={`${filterId}-trigger`}
                id={`${filterId}-listbox`}
              >
                {filterOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer data-[selected=true]:bg-accent"
                    aria-selected={value === option.value}
                    role="option"
                    data-selected={value === option.value}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-shrink-0 w-4">{value === option.value && <Check className="h-4 w-4" />}</div>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Hidden description for screen readers */}
      <VisuallyHidden id={`${filterId}-description`}>
        Select a sorting option from the dropdown list. Use arrow keys to navigate, Enter to select, and Escape to close
        the dropdown.
      </VisuallyHidden>
    </div>
  )
}

export default DropdownFilter

