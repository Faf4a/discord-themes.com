import { useState, useEffect } from "react"
import { ThemeCard } from "./card"
import { type Theme } from "@types"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@components/ui/pagination"
import { Input } from "@components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function ThemeGrid({ themes = [], disableDownloads = false }: { themes?: Theme[], disableDownloads?: boolean }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isEllipsisClicked, setIsEllipsisClicked] = useState(false)
  const [inputPage, setInputPage] = useState("")
  const itemsPerPage = 12

  useEffect(() => {
    if (currentPage > Math.ceil(themes.length / itemsPerPage)) {
      setCurrentPage(1)
    }
  }, [themes, currentPage])

  const totalPages = Math.ceil(themes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentThemes = themes.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setIsEllipsisClicked(false)
    setInputPage("")
  }

  const handleEllipsisClick = () => {
    setIsEllipsisClicked(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value)
  }

  const handleInputBlur = () => {
    const pageNumber = parseInt(inputPage, 10)
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
    setIsEllipsisClicked(false)
    setInputPage("")
  }

  const renderPaginationItems = () => {
    const items = []
    const visiblePages = 5

    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      const leftBound = Math.max(1, currentPage - Math.floor(visiblePages / 2))
      const rightBound = Math.min(totalPages, leftBound + visiblePages - 1)

      if (leftBound > 1) {
        items.push(
          <PaginationItem key={1}>
            <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
          </PaginationItem>
        )
        if (leftBound > 2) {
          items.push(
            <PaginationItem key="leftEllipsis">
              <PaginationEllipsis onClick={handleEllipsisClick} />
            </PaginationItem>
          )
        }
      }

      for (let i = leftBound; i <= rightBound; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }

      if (rightBound < totalPages) {
        if (rightBound < totalPages - 1) {
          items.push(
            <PaginationItem key="rightEllipsis">
              <PaginationEllipsis onClick={handleEllipsisClick} />
            </PaginationItem>
          )
        }
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
          </PaginationItem>
        )
      }
    }

    return items
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentThemes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} disableDownloads={disableDownloads} />
        ))}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </PaginationPrevious>
          </PaginationItem>
          {renderPaginationItems()}
          {isEllipsisClicked && (
            <PaginationItem>
              <Input
                type="text"
                value={inputPage}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="w-12 h-8 text-center"
                autoFocus
              />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}