import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({ currentPage, totalItems, pageSize, onPageChange }: ProductPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);

  return (
    <nav aria-label="Paginación del catálogo" className="mt-12 flex items-center justify-center gap-2">
      <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Página anterior" className="flex size-11 items-center justify-center rounded-xl border border-[#d8e1ec] bg-white text-[#334862] hover:border-[#249fd3] hover:text-[#249fd3] disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft size={19} /></button>
      {pages.map((page) => <button key={page} type="button" onClick={() => onPageChange(page)} aria-current={page === currentPage ? "page" : undefined} className={`flex size-11 items-center justify-center rounded-xl text-sm font-black ${page === currentPage ? "bg-[#249fd3] text-white" : "border border-[#d8e1ec] bg-white text-[#334862] hover:border-[#249fd3] hover:text-[#249fd3]"}`}>{page}</button>)}
      <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} aria-label="Página siguiente" className="flex size-11 items-center justify-center rounded-xl border border-[#d8e1ec] bg-white text-[#334862] hover:border-[#249fd3] hover:text-[#249fd3] disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight size={19} /></button>
    </nav>
  );
}
