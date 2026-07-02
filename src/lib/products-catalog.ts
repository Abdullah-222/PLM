import { seedProducts } from "@/constants/seed-products";
import { users } from "@/constants/users";
import { useProductsStore } from "@/store/products-store";
import type { CreateProductInput, Product, User } from "@/types";

export function getAllProducts(): Product[] {
  const { createdProducts } = useProductsStore.getState();
  return [...seedProducts, ...createdProducts];
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

export function getUniqueOwners(): User[] {
  const seen = new Map<string, User>();
  for (const product of getAllProducts()) {
    seen.set(product.owner.id, product.owner);
  }
  for (const user of users) {
    seen.set(user.id, user);
  }
  return Array.from(seen.values());
}

export function generatePartNumber(): string {
  const numbers = getAllProducts()
    .map((p) => p.partNumber.match(/^ITEM-(\d+)$/i)?.[1])
    .filter(Boolean)
    .map((n) => Number(n));

  const next = (numbers.length > 0 ? Math.max(...numbers) : 1000) + 1;
  return `ITEM-${next}`;
}

export function isPartNumberTaken(partNumber: string, excludeId?: string): boolean {
  const normalized = partNumber.trim().toUpperCase();
  return getAllProducts().some(
    (p) =>
      p.partNumber.toUpperCase() === normalized && (!excludeId || p.id !== excludeId)
  );
}

export function createProductFromInput(input: CreateProductInput): Product {
  const owner = users.find((u) => u.id === input.ownerId) ?? users[0];
  const now = new Date().toISOString();
  const id = `prod-${crypto.randomUUID().slice(0, 8)}`;

  return {
    id,
    partNumber: input.partNumber.trim().toUpperCase(),
    name: input.name.trim(),
    description: input.description.trim(),
    revision: input.revision.trim().toUpperCase() || "A",
    lifecycleState: input.lifecycleState,
    status: input.lifecycleState,
    owner,
    createdAt: now,
    updatedAt: now,
    category: input.category.trim(),
    type: input.productType === "Assembly" ? "Assembly" : input.productType === "Module" ? "Module" : "Part",
    productType: input.productType,
    weight: input.weight?.trim() || undefined,
    material: input.material?.trim() || undefined,
    documents: 0,
    bomItems: 0,
    tags: input.tags?.filter(Boolean) ?? [],
    department: input.department.trim() || owner.department,
  };
}

export const PLM_CATEGORIES = [
  "Propulsion",
  "Power Systems",
  "Hydraulics",
  "Avionics",
  "Fuel System",
  "Structures",
  "Landing Gear",
  "Environmental",
  "Electrical",
  "Software",
  "Quality",
  "Manufacturing",
] as const;
