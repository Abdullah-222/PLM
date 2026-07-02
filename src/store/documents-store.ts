import { create } from "zustand";
import { currentUser } from "@/constants/users";
import type { ManagedDocument } from "@/types/documents";

interface DocumentsState {
  checkoutOverrides: Record<
    string,
    { status: "Checked In" | "Checked Out"; userId?: string; at?: string }
  >;
  checkOut: (documentId: string) => void;
  checkIn: (documentId: string) => void;
  getCheckoutState: (
    doc: ManagedDocument
  ) => Pick<ManagedDocument, "checkoutStatus" | "checkedOutBy" | "checkedOutAt">;
}

export const useDocumentsStore = create<DocumentsState>()((set, get) => ({
  checkoutOverrides: {},
  checkOut: (documentId) =>
    set((s) => ({
      checkoutOverrides: {
        ...s.checkoutOverrides,
        [documentId]: {
          status: "Checked Out",
          userId: currentUser.id,
          at: new Date().toISOString(),
        },
      },
    })),
  checkIn: (documentId) =>
    set((s) => ({
      checkoutOverrides: {
        ...s.checkoutOverrides,
        [documentId]: { status: "Checked In" },
      },
    })),
  getCheckoutState: (doc) => {
    const override = get().checkoutOverrides[doc.id];
    if (!override) {
      return {
        checkoutStatus: doc.checkoutStatus,
        checkedOutBy: doc.checkedOutBy,
        checkedOutAt: doc.checkedOutAt,
      };
    }
    if (override.status === "Checked In") {
      return { checkoutStatus: "Checked In" };
    }
    return {
      checkoutStatus: "Checked Out",
      checkedOutBy: currentUser,
      checkedOutAt: override.at,
    };
  },
}));
