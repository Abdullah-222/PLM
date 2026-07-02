import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createProductFromInput } from "@/lib/products-catalog";
import type { CreateProductInput, Product } from "@/types";

interface ProductsState {
  createdProducts: Product[];
  addProduct: (input: CreateProductInput) => Product;
  archiveProduct: (id: string) => void;
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      createdProducts: [],
      addProduct: (input) => {
        const product = createProductFromInput(input);
        set({ createdProducts: [product, ...get().createdProducts] });
        return product;
      },
      archiveProduct: (id) => {
        set({
          createdProducts: get().createdProducts.map((p) =>
            p.id === id
              ? {
                  ...p,
                  lifecycleState: "Archived",
                  status: "Archived",
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        });
      },
    }),
    { name: "plm-products" }
  )
);
