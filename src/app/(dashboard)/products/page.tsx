"use client";

import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { CreateProductDialog } from "@/components/product/create-product-dialog";
import { ProductsFilters } from "@/components/product/products-filters";
import { ProductsTable } from "@/components/product/products-table";
import { Button } from "@/components/ui/button";
import { getAllProducts, getUniqueOwners } from "@/lib/products-catalog";
import { filterProducts, type ProductFilters } from "@/lib/product-utils";
import { useProductsStore } from "@/store/products-store";
import { Download, Plus, Upload } from "lucide-react";

const defaultFilters: ProductFilters = {
  search: "",
  lifecycleState: "All",
  productType: "All",
  ownerId: "All",
};

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const createdProducts = useProductsStore((s) => s.createdProducts);

  const allProducts = useMemo(() => getAllProducts(), [createdProducts]);
  const owners = useMemo(() => getUniqueOwners(), [createdProducts]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(
    () => filterProducts(allProducts, filters),
    [allProducts, filters]
  );

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <PageContainer>
      <SectionHeader
        title="Products"
        description={`${allProducts.length} items in product catalog`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Product
            </Button>
          </div>
        }
      />

      <ProductsFilters
        filters={filters}
        owners={owners}
        onChange={setFilters}
      />

      <ProductsTable
        data={filteredProducts}
        loading={loading}
        onClearFilters={clearFilters}
      />

      <CreateProductDialog open={createOpen} onOpenChange={setCreateOpen} />
    </PageContainer>
  );
}
