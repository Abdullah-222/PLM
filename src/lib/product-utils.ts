import type { LifecycleState, Product, ProductType } from "@/types";

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatLifecycleLabel(state: LifecycleState): string {
  if (state === "In Review") return "Review";
  return state;
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleDateString("en-US", options);
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export interface ProductFilters {
  search: string;
  lifecycleState: LifecycleState | "All";
  productType: ProductType | "All";
  ownerId: string | "All";
}

export function filterProducts(products: Product[], filters: ProductFilters) {
  const query = filters.search.trim().toLowerCase();

  return products.filter((product) => {
    const matchesSearch =
      !query ||
      product.partNumber.toLowerCase().includes(query) ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.productType.toLowerCase().includes(query) ||
      product.owner.name.toLowerCase().includes(query);

    const matchesLifecycle =
      filters.lifecycleState === "All" ||
      product.lifecycleState === filters.lifecycleState;

    const matchesType =
      filters.productType === "All" ||
      product.productType === filters.productType;

    const matchesOwner =
      filters.ownerId === "All" || product.owner.id === filters.ownerId;

    return matchesSearch && matchesLifecycle && matchesType && matchesOwner;
  });
}

export const LIFECYCLE_FILTER_OPTIONS: (LifecycleState | "All")[] = [
  "All",
  "Draft",
  "In Review",
  "Released",
  "Obsolete",
];

export const PRODUCT_TYPE_OPTIONS: (ProductType | "All")[] = [
  "All",
  "Mechanical",
  "Electrical",
  "Assembly",
  "Module",
  "Part",
  "Software",
];
