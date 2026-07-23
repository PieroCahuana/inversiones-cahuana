import { useMemo } from "react";
import { useSearchParams } from "react-router";

import type { ProductFilters } from "../types/product";

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ProductFilters>(() => {
    const condition = searchParams.get("condition");

    return {
      page_size: 12,
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      brand: searchParams.get("brand") || undefined,
      condition: condition && ["new", "refurbished", "used"].includes(condition)
        ? condition as ProductFilters["condition"]
        : undefined,
      in_stock: searchParams.get("in_stock") === "true" || undefined,
      min_price: searchParams.get("min_price") || undefined,
      max_price: searchParams.get("max_price") || undefined,
      ordering: searchParams.get("ordering") || undefined,
      page: searchParams.has("page")
        ? Math.max(1, Number(searchParams.get("page")) || 1)
        : undefined,
    };
  }, [searchParams]);

  function setFilter(key: keyof ProductFilters, value?: string | number | boolean) {
    const next = new URLSearchParams(searchParams);

    if (value === undefined || value === "" || value === false) next.delete(key);
    else next.set(key, String(value));

    if (key !== "page") next.delete("page");
    setSearchParams(next, { replace: key === "search" });
  }

  function clearFilters() {
    setSearchParams({});
  }

  const activeFilterCount = ["category", "brand", "condition", "in_stock", "min_price", "max_price"]
    .filter((key) => searchParams.has(key)).length;

  return { filters, setFilter, clearFilters, activeFilterCount };
}
