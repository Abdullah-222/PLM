"use client";

import { Suspense } from "react";
import { ChangeWizard } from "@/components/changes";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import type { EngineeringChangeType } from "@/types/changes";
import { useSearchParams } from "next/navigation";

function CreateChangeContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as EngineeringChangeType) ?? "ECR";

  return <ChangeWizard initialType={type === "ECO" ? "ECO" : "ECR"} />;
}

export default function CreateChangePage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Create Change"
        description="Multi-step wizard to create an engineering change request or order"
      />
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading wizard...</div>}>
        <CreateChangeContent />
      </Suspense>
    </PageContainer>
  );
}
