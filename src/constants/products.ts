import type {
  Product,
  ProductWorkspace,
  WorkflowStep,
  BOMItem,
  Document,
  Revision,
  ChangeRequest,
  Activity,
  ProductMetadata,
} from "@/types";
import { users } from "./users";
import { seedProducts } from "./seed-products";
import { useProductsStore } from "@/store/products-store";

export { seedProducts };
export const products = seedProducts;

function resolveProduct(id: string): Product {
  const { createdProducts } = useProductsStore.getState();
  return (
    createdProducts.find((p) => p.id === id) ??
    seedProducts.find((p) => p.id === id) ??
    seedProducts[0]
  );
}

const engineBom: BOMItem[] = [
  {
    id: "bom-root",
    partNumber: "ITEM-1001",
    name: "Engine Assembly",
    quantity: 1,
    unit: "EA",
    level: 0,
    children: [
      {
        id: "bom-001",
        partNumber: "ITEM-1001-01",
        name: "Cylinder Head",
        quantity: 1,
        unit: "EA",
        level: 1,
      },
      {
        id: "bom-002",
        partNumber: "ITEM-1001-02",
        name: "Pistons",
        quantity: 6,
        unit: "EA",
        level: 1,
        children: [
          {
            id: "bom-002a",
            partNumber: "ITEM-1001-02-A",
            name: "Piston Ring Set",
            quantity: 3,
            unit: "SET",
            level: 2,
          },
        ],
      },
      {
        id: "bom-003",
        partNumber: "ITEM-1001-03",
        name: "Crankshaft",
        quantity: 1,
        unit: "EA",
        level: 1,
      },
      {
        id: "bom-004",
        partNumber: "ITEM-1001-04",
        name: "Bearings",
        quantity: 8,
        unit: "EA",
        level: 1,
        children: [
          {
            id: "bom-004a",
            partNumber: "ITEM-1001-04-A",
            name: "Main Bearing",
            quantity: 5,
            unit: "EA",
            level: 2,
          },
          {
            id: "bom-004b",
            partNumber: "ITEM-1001-04-B",
            name: "Rod Bearing",
            quantity: 3,
            unit: "EA",
            level: 2,
          },
        ],
      },
    ],
  },
];

const defaultDocuments: Document[] = [
  {
    id: "doc-req",
    name: "Requirements.pdf",
    type: "PDF",
    version: "2.1",
    size: "1.8 MB",
    uploadedBy: users[0],
    uploadedAt: "2026-05-12T10:00:00Z",
    status: "Released",
  },
  {
    id: "doc-cad",
    name: "CAD_Model.step",
    type: "CAD",
    version: "4.0",
    size: "128.4 MB",
    uploadedBy: users[1],
    uploadedAt: "2026-05-15T14:30:00Z",
    status: "Released",
  },
  {
    id: "doc-test",
    name: "Testing_Report.pdf",
    type: "PDF",
    version: "1.3",
    size: "6.2 MB",
    uploadedBy: users[2],
    uploadedAt: "2026-05-18T09:00:00Z",
    status: "In Review",
  },
];

const defaultRevisions: Revision[] = [
  {
    id: "rev-c",
    revision: "C",
    description: "Production release — final tolerance stack-up and coating spec",
    author: users[0],
    createdAt: "2026-05-20T14:22:00Z",
    status: "Released",
  },
  {
    id: "rev-b",
    revision: "B",
    description: "Design review updates — revised interface geometry",
    author: users[0],
    createdAt: "2025-11-14T10:00:00Z",
    status: "Obsolete",
  },
  {
    id: "rev-a",
    revision: "A",
    description: "Initial engineering release",
    author: users[1],
    createdAt: "2024-03-12T09:00:00Z",
    status: "Obsolete",
  },
];

const defaultChanges: ChangeRequest[] = [
  {
    id: "ECR-001",
    title: "Update interface bolt pattern",
    type: "Engineering Change",
    priority: "High",
    status: "In Progress",
    requestedBy: users[0],
    createdAt: "2026-05-10T09:00:00Z",
    description: "Revise mounting flange bolt pattern per manufacturing feedback",
  },
  {
    id: "ECO-004",
    title: "Material substitution for housing",
    type: "Engineering Change",
    priority: "Medium",
    status: "Pending",
    requestedBy: users[3],
    createdAt: "2026-05-14T11:30:00Z",
    description: "Substitute aluminum alloy for improved corrosion resistance",
  },
];

const defaultActivities: Activity[] = [
  {
    id: "act-1",
    action: "Revision Released",
    description: "Rev C released to production after final approval",
    user: users[0],
    timestamp: "2026-05-25T14:30:00Z",
    type: "approve",
  },
  {
    id: "act-2",
    action: "Document Uploaded",
    description: "CAD_Model.step updated to version 4.0",
    user: users[1],
    timestamp: "2026-05-25T11:15:00Z",
    type: "upload",
  },
  {
    id: "act-3",
    action: "Workflow Approved",
    description: "Quality engineering sign-off completed",
    user: users[2],
    timestamp: "2026-05-24T16:45:00Z",
    type: "review",
  },
  {
    id: "act-4",
    action: "Change Request Created",
    description: "ECR-001 opened for interface bolt pattern update",
    user: users[3],
    timestamp: "2026-05-23T09:30:00Z",
    type: "create",
  },
  {
    id: "act-5",
    action: "Comment Added",
    description: "Manufacturing noted tolerance concern on bearing fit",
    user: users[4],
    timestamp: "2026-05-22T14:00:00Z",
    type: "comment",
  },
];

function buildWorkflow(lifecycleState: Product["lifecycleState"]): WorkflowStep[] {
  const steps: WorkflowStep[] = [
    { id: "draft", label: "Draft", status: "upcoming" },
    { id: "review", label: "Review", status: "upcoming", approvers: [users[1], users[2]] },
    { id: "approved", label: "Approved", status: "upcoming", approvers: [users[4]] },
    { id: "released", label: "Released", status: "upcoming", approvers: [users[0]] },
  ];

  const stateIndex: Record<string, number> = {
    Draft: 0,
    "In Review": 1,
    Released: 3,
    Obsolete: 3,
    Frozen: 3,
    Archived: 3,
  };

  const current = stateIndex[lifecycleState] ?? 0;

  return steps.map((step, index) => {
    if (index < current) {
      return { ...step, status: "completed" as const, completedAt: "2026-05-01T10:00:00Z" };
    }
    if (index === current || (lifecycleState === "In Review" && index === 1)) {
      return { ...step, status: "current" as const };
    }
    if (lifecycleState === "In Review" && index === 2) {
      return { ...step, status: "upcoming" as const };
    }
    return step;
  });
}

function buildMetadata(product: Product): ProductMetadata {
  return {
    productName: product.name,
    category: product.category,
    description: product.description,
    ownerId: product.owner.id,
    department: product.department ?? product.owner.department,
    tags: product.tags ?? [],
  };
}

function isUserCreatedProduct(product: Product): boolean {
  return useProductsStore
    .getState()
    .createdProducts.some((p) => p.id === product.id);
}

function buildWorkspace(product: Product): ProductWorkspace {
  const isEngine = product.id === "prod-001";
  const isUserCreated = isUserCreatedProduct(product);

  if (isUserCreated) {
    return {
      documents: [],
      bom: [
        {
          id: `${product.id}-bom-root`,
          partNumber: product.partNumber,
          name: product.name,
          quantity: 1,
          unit: "EA",
          level: 0,
        },
      ],
      revisions: [
        {
          id: `${product.id}-rev-0`,
          revision: product.revision,
          description: "Initial item creation",
          author: product.owner,
          createdAt: product.createdAt,
          status: product.lifecycleState,
        },
      ],
      changes: [],
      activities: [
        {
          id: `${product.id}-act-0`,
          action: "Item Created",
          description: `${product.name} (${product.partNumber}) created in catalog`,
          user: product.owner,
          timestamp: product.createdAt,
          type: "create",
        },
      ],
      workflow: buildWorkflow(product.lifecycleState),
      metadata: buildMetadata(product),
      kpis: {
        documentsCount: 0,
        partsCount: 0,
        openChanges: 0,
        pendingApprovals: product.lifecycleState === "In Review" ? 1 : 0,
      },
    };
  }

  return {
    documents: defaultDocuments.map((doc, i) => ({
      ...doc,
      id: `${product.id}-doc-${i}`,
      name: isEngine
        ? doc.name
        : doc.name.replace("CAD_Model", `${product.partNumber}_CAD`),
    })),
    bom: isEngine
      ? engineBom
      : [
          {
            id: `${product.id}-bom-root`,
            partNumber: product.partNumber,
            name: product.name,
            quantity: 1,
            unit: "EA",
            level: 0,
            children: Array.from({ length: Math.min(product.bomItems, 4) }, (_, i) => ({
              id: `${product.id}-bom-${i}`,
              partNumber: `${product.partNumber}-${String(i + 1).padStart(2, "0")}`,
              name: `Sub-assembly ${i + 1}`,
              quantity: i + 1,
              unit: "EA",
              level: 1,
            })),
          },
        ],
    revisions: defaultRevisions.map((rev, i) => ({
      ...rev,
      id: `${product.id}-rev-${i}`,
      revision: i === 0 ? product.revision : rev.revision,
      status: i === 0 ? product.lifecycleState : rev.status,
    })),
    changes: defaultChanges.map((cr, i) => ({
      ...cr,
      id: i === 0 ? "ECR-001" : "ECO-004",
    })),
    activities: defaultActivities.map((act, i) => ({
      ...act,
      id: `${product.id}-act-${i}`,
      description: act.description.replace("Rev C", `Rev ${product.revision}`),
    })),
    workflow: buildWorkflow(product.lifecycleState),
    metadata: buildMetadata(product),
    kpis: {
      documentsCount: product.documents,
      partsCount: product.bomItems,
      openChanges: product.lifecycleState === "Released" ? 1 : 2,
      pendingApprovals: product.lifecycleState === "In Review" ? 2 : 0,
    },
  };
}

const workspaceCache = new Map<string, ProductWorkspace>();

export function getProductById(id: string): Product | undefined {
  const { createdProducts } = useProductsStore.getState();
  return (
    createdProducts.find((p) => p.id === id) ??
    seedProducts.find((p) => p.id === id)
  );
}

export function getProductWorkspace(productId: string): ProductWorkspace {
  const cached = workspaceCache.get(productId);
  if (cached) return cached;

  const product = resolveProduct(productId);
  const workspace = buildWorkspace(product);
  workspaceCache.set(productId, workspace);
  return workspace;
}
