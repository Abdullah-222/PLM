"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ProductStatusBadge } from "@/components/product/product-status-badge";
import {
  ReleasePackageCard,
  RevisionTimeline,
} from "@/components/revisions";
import { Separator } from "@/components/ui/separator";
import {
  getReleasePackage,
  getRevisionById,
  getRevisionTimeline,
} from "@/constants/revisions-data";
import { formatDate } from "@/lib/product-utils";
import { ArrowLeft, GitBranch, Package } from "lucide-react";

export default function RevisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const revision = getRevisionById(id);

  if (!revision) {
    notFound();
  }

  const timeline = getRevisionTimeline(id);
  const releasePackage = getReleasePackage(id);

  return (
    <PageContainer className="space-y-0">
      <div className="sticky top-14 z-20 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-start gap-4">
          <Link
            href="/revisions"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">
                {revision.objectName}
              </h1>
              <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded font-bold">
                Rev {revision.revision}
              </span>
              <ProductStatusBadge status={revision.state} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-mono text-xs">{revision.objectPartNumber}</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {revision.owner.name}
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span>
                Created {formatDate(revision.createdAt, { dateStyle: "long" })}
              </span>
              {revision.releaseDate && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>
                    Released{" "}
                    {formatDate(revision.releaseDate, { dateStyle: "long" })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AppCard>
          <AppCardHeader>
            <SectionHeader
              title="Revision Timeline"
              description="Creation, approvals, changes, and release events"
            />
          </AppCardHeader>
          <AppCardContent>
            <RevisionTimeline events={timeline} />
          </AppCardContent>
        </AppCard>

        <div className="space-y-4">
          <AppCard>
            <AppCardHeader>
              <SectionHeader title="Revision Summary" />
            </AppCardHeader>
            <AppCardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {revision.description}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Lifecycle
                  </p>
                  <div className="mt-1">
                    <ProductStatusBadge status={revision.state} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Owner
                  </p>
                  <p className="text-sm mt-1">{revision.owner.name}</p>
                </div>
              </div>
            </AppCardContent>
          </AppCard>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Release Package</h2>
            </div>
            <ReleasePackageCard releasePackage={releasePackage} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
