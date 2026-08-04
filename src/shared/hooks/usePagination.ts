type PaginationItem = number | "...";

interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}

export function usePagination({
  currentPage,
  totalPages,
  siblingCount = 1,
}: UsePaginationProps): PaginationItem[] {
  if (totalPages <= 0) return [];

  const totalPageNumbers = siblingCount * 2 + 5;

  // Show every page when there aren't many
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  // Only right dots
  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => i + 1,
    );

    return [...leftRange, "...", totalPages];
  }

  // Only left dots
  if (showLeftDots && !showRightDots) {
    const rightRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => totalPages - (2 + 2 * siblingCount) + i,
    );

    return [1, "...", ...rightRange];
  }

  // Both dots
  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );

  return [1, "...", ...middleRange, "...", totalPages];
}
