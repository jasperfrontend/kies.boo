
import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  initialItemsPerPage?: number;
}

export const usePagination = ({ totalItems, initialItemsPerPage = 20 }: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = useMemo(() => {
    if (itemsPerPage === -1) return 1; // "All" option
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  const startIndex = useMemo(() => {
    if (itemsPerPage === -1) return 0;
    return (currentPage - 1) * itemsPerPage;
  }, [currentPage, itemsPerPage]);

  const endIndex = useMemo(() => {
    if (itemsPerPage === -1) return totalItems;
    return Math.min(startIndex + itemsPerPage, totalItems);
  }, [startIndex, itemsPerPage, totalItems]);

  const paginatedItems = useMemo(() => {
    return (items: any[]) => {
      if (itemsPerPage === -1) return items;
      return items.slice(startIndex, endIndex);
    };
  }, [startIndex, endIndex, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const changeItemsPerPage = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    paginatedItems,
    goToPage,
    changeItemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};
