import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ThemeCard } from "./card";
import { type Theme } from "@types";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@components/ui/pagination";
import { Input } from "@components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ThemeGrid({ themes = [], likedThemes = [], disableDownloads = false, endlessScroll = false }: { themes?: Theme[]; likedThemes?: []; disableDownloads?: boolean; endlessScroll?: boolean }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [isEllipsisClicked, setIsEllipsisClicked] = useState(false);
    const [inputPage, setInputPage] = useState("");
    const [inputError, setInputError] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const itemsPerPage = 12;

    useEffect(() => {
        if (!endlessScroll && currentPage > Math.ceil(themes.length / itemsPerPage)) {
            setCurrentPage(1);
        }
    }, [themes, currentPage, endlessScroll]);

    const totalPages = Math.ceil(themes.length / itemsPerPage);
    const startIndex = endlessScroll ? 0 : (currentPage - 1) * itemsPerPage;
    const endIndex = endlessScroll ? themes.length : startIndex + itemsPerPage;
    const currentThemes = themes.slice(startIndex, endIndex);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setIsEllipsisClicked(false);
        setInputPage("");
        scrollToTop();
    };

    const handleEllipsisClick = () => {
        setIsEllipsisClicked(true);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputError(false);
        setInputPage(e.target.value);
    };

    const handleInputBlur = () => {
        const pageNumber = parseInt(inputPage, 10);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            scrollToTop();
            setInputError(false);
        } else {
            setInputError(true);
        }
        setIsEllipsisClicked(false);
        setInputPage("");
    };

    const renderPaginationItems = () => {
        const items = [];
        const visiblePages = 5;

        if (totalPages <= visiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            const leftBound = Math.max(1, currentPage - Math.floor(visiblePages / 2));
            const rightBound = Math.min(totalPages, leftBound + visiblePages - 1);

            if (leftBound > 1) {
                items.push(
                    <PaginationItem key={1}>
                        <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                    </PaginationItem>
                );
                if (leftBound > 2) {
                    items.push(
                        <PaginationItem key="leftEllipsis">
                            <PaginationEllipsis onClick={handleEllipsisClick} />
                        </PaginationItem>
                    );
                }
            }

            for (let i = leftBound; i <= rightBound; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (rightBound < totalPages) {
                if (rightBound < totalPages - 1) {
                    items.push(
                        <PaginationItem key="rightEllipsis">
                            <PaginationEllipsis onClick={handleEllipsisClick} />
                        </PaginationItem>
                    );
                }
                items.push(
                    <PaginationItem key={totalPages}>
                        <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                    </PaginationItem>
                );
            }
        }

        return items;
    };

    return (
        <div className="space-y-6" ref={gridRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentThemes.map((theme) => (
                    <ThemeCard key={theme.id} theme={theme} likedThemes={likedThemes} disableDownloads={disableDownloads} />
                ))}
            </div>
            {!endlessScroll && (
                <Pagination className="w-full" role="navigation" aria-label="Page navigation">
                    <PaginationContent className="flex flex-wrap gap-2">
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                className={`text-sm transition-all hover:bg-primary 
                                    ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                                aria-label={`Go to previous page, page ${currentPage - 1}`}
                                title={`Previous page (${currentPage - 1})`}
                                onKeyDown={(e) => e.key === "Enter" && handlePageChange(Math.max(1, currentPage - 1))}
                                tabIndex={0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">Previous</span>
                            </PaginationPrevious>
                        </PaginationItem>

                        <PaginationItem className="md:hidden">
                            <PaginationLink isActive aria-current="page" aria-label={`Current page, page ${currentPage}`}>
                                {currentPage}
                            </PaginationLink>
                        </PaginationItem>

                        <div className="hidden md:flex items-center gap-1">
                            {renderPaginationItems()}
                            {isEllipsisClicked && (
                                <PaginationItem>
                                    <Input
                                        type="text"
                                        value={inputPage}
                                        onChange={handleInputChange}
                                        onBlur={handleInputBlur}
                                        onKeyDown={(e) => e.key === "Enter" && handleInputBlur()}
                                        className={`w-16 h-8 text-center transition-all focus:ring-2
                                            ${inputError ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`}
                                        aria-label="Go to page number"
                                        placeholder="Page"
                                        maxLength={4}
                                        aria-invalid={inputError}
                                    />
                                </PaginationItem>
                            )}
                        </div>

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                className={`text-sm transition-all hover:bg-primary
                                    ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                                aria-label={`Go to next page, page ${currentPage + 1}`}
                                title={`Next page (${currentPage + 1})`}
                                onKeyDown={(e) => e.key === "Enter" && handlePageChange(Math.min(totalPages, currentPage + 1))}
                                tabIndex={0}
                            >
                                <span className="sr-only md:not-sr-only md:mr-2">Next</span>
                                <ChevronRight className="h-4 w-4" />
                            </PaginationNext>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
