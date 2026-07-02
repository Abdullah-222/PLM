import { create } from "zustand";
import { currentUser } from "@/constants/users";
import { initialFolders, initialCadFiles } from "@/constants/cad-data";
import type { CadFile, CadFolder, CadComment, CadVersion, CadModelNode } from "@/types/cad";
import type { User } from "@/types";

interface CadState {
  folders: CadFolder[];
  files: CadFile[];
  activeFolderId: string | "All";
  activeFileId: string | null;
  historyLogs: Record<string, string[]>; // File history logs: fileId -> string[]

  // Folder Actions
  setActiveFolderId: (id: string | "All") => void;
  createFolder: (name: string, parentId: string | null) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  duplicateFolder: (id: string) => void;
  moveFolder: (id: string, newParentId: string | null) => void;

  // File Actions
  setActiveFileId: (id: string | null) => void;
  uploadCadFile: (file: Omit<CadFile, "id" | "owner" | "createdAt" | "lastModified" | "lockStatus" | "checkoutStatus" | "versions" | "comments">) => void;
  updateMetadata: (fileId: string, metadata: Partial<CadFile>) => void;
  checkOutFile: (fileId: string, reason: string) => void;
  checkInFile: (fileId: string) => void;
  cancelCheckout: (fileId: string) => void;
  transferLock: (fileId: string, targetUserId: string) => void;
  lockFile: (fileId: string) => void;
  unlockFile: (fileId: string) => void;
  deleteFile: (fileId: string) => void;
  duplicateFile: (fileId: string) => void;
  moveFile: (fileId: string, targetFolderId: string) => void;
  
  // Comments Actions
  addComment: (fileId: string, content: string) => void;
  addReply: (fileId: string, commentId: string, content: string) => void;
  resolveThread: (fileId: string, commentId: string) => void;

  // Version Actions
  restoreVersion: (fileId: string, versionNumber: number) => void;
  releaseModel: (fileId: string) => void;
  addVersion: (fileId: string, changeSummary: string) => void;

  // Model Tree Node Visibility Actions
  togglePartVisibility: (fileId: string, nodeId: string) => void;
}

export const useCadStore = create<CadState>()((set, get) => ({
  folders: initialFolders,
  files: initialCadFiles,
  activeFolderId: "All",
  activeFileId: null,
  historyLogs: {},

  setActiveFolderId: (id) => set({ activeFolderId: id }),
  setActiveFileId: (id) => set({ activeFileId: id }),

  // Folder Actions
  createFolder: (name, parentId) => set((state) => {
    const newFolder: CadFolder = {
      id: `folder-${Date.now()}`,
      name,
      parentId,
    };
    return { folders: [...state.folders, newFolder] };
  }),

  renameFolder: (id, name) => set((state) => ({
    folders: state.folders.map((f) => (f.id === id ? { ...f, name } : f)),
  })),

  deleteFolder: (id) => set((state) => {
    // Delete target folder and all subfolders recursively
    const getFolderIdsToDelete = (folderId: string): string[] => {
      const children = state.folders.filter((f) => f.parentId === folderId);
      return [folderId, ...children.flatMap((c) => getFolderIdsToDelete(c.id))];
    };
    const folderIdsToDelete = getFolderIdsToDelete(id);

    return {
      folders: state.folders.filter((f) => !folderIdsToDelete.includes(f.id)),
      // Move orphaned files to parent of the deleted folder, or "All"
      files: state.files.map((file) => {
        if (folderIdsToDelete.includes(file.folderId)) {
          const parentFolder = state.folders.find((f) => f.id === id);
          return { ...file, folderId: parentFolder?.parentId || "f-1" };
        }
        return file;
      }),
      activeFolderId: state.activeFolderId === id ? "All" : state.activeFolderId,
    };
  }),

  duplicateFolder: (id) => set((state) => {
    const folderToCopy = state.folders.find((f) => f.id === id);
    if (!folderToCopy) return {};

    const newFolderId = `folder-dup-${Date.now()}`;
    const newFolder: CadFolder = {
      id: newFolderId,
      name: `${folderToCopy.name} (Copy)`,
      parentId: folderToCopy.parentId,
    };

    // Duplicate files in this folder as well
    const duplicatedFiles = state.files
      .filter((file) => file.folderId === id)
      .map((file, idx) => ({
        ...file,
        id: `cad-file-dup-${Date.now()}-${idx}`,
        fileName: `Copy_of_${file.fileName}`,
        partNumber: `${file.partNumber}-DUP`,
        folderId: newFolderId,
        lockStatus: { locked: false },
        checkoutStatus: { checkedOut: false },
      }));

    return {
      folders: [...state.folders, newFolder],
      files: [...state.files, ...duplicatedFiles],
    };
  }),

  moveFolder: (id, newParentId) => set((state) => {
    // Prevent cycles
    if (id === newParentId) return {};
    return {
      folders: state.folders.map((f) => (f.id === id ? { ...f, parentId: newParentId } : f)),
    };
  }),

  // File Actions
  uploadCadFile: (newFile) => set((state) => {
    const fileId = `cad-file-upload-${Date.now()}`;
    const file: CadFile = {
      ...newFile,
      id: fileId,
      owner: currentUser,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      lockStatus: { locked: false },
      checkoutStatus: { checkedOut: false },
      versions: [
        {
          version: 1,
          revision: newFile.currentRevision,
          date: new Date().toISOString(),
          author: currentUser,
          changeSummary: "Initial CAD Upload",
          status: newFile.status,
          size: newFile.size,
        },
      ],
      comments: [],
    };
    return {
      files: [file, ...state.files],
      historyLogs: {
        ...state.historyLogs,
        [fileId]: [`[${new Date().toLocaleString()}] CAD model uploaded by ${currentUser.name}`],
      },
    };
  }),

  updateMetadata: (fileId, metadata) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          ...metadata,
          lastModified: new Date().toISOString(),
        };
      }
      return file;
    });

    const logs = state.historyLogs[fileId] || [];
    const updatedLogs = [
      ...logs,
      `[${new Date().toLocaleString()}] Metadata updated by ${currentUser.name}`,
    ];

    return {
      files: updatedFiles,
      historyLogs: {
        ...state.historyLogs,
        [fileId]: updatedLogs,
      },
    };
  }),

  checkOutFile: (fileId, reason) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          checkoutStatus: {
            checkedOut: true,
            checkedOutBy: currentUser,
            checkedOutAt: new Date().toISOString(),
            reason,
          },
          lockStatus: {
            locked: true,
            lockedBy: currentUser,
            lockedAt: new Date().toISOString(),
          },
          lastModified: new Date().toISOString(),
        };
      }
      return file;
    });

    const logs = state.historyLogs[fileId] || [];
    const updatedLogs = [
      ...logs,
      `[${new Date().toLocaleString()}] Checked out by ${currentUser.name}. Reason: ${reason}`,
    ];

    return {
      files: updatedFiles,
      historyLogs: {
        ...state.historyLogs,
        [fileId]: updatedLogs,
      },
    };
  }),

  checkInFile: (fileId) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        // Create new version on check in
        const currentVersion = file.versions.length;
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nextRev = alphabet[currentVersion % alphabet.length];
        
        const newVersion: CadVersion = {
          version: currentVersion + 1,
          revision: nextRev,
          date: new Date().toISOString(),
          author: currentUser,
          changeSummary: file.checkoutStatus.reason || "Updated via Check In",
          status: "Draft",
          size: file.size,
        };

        return {
          ...file,
          currentRevision: nextRev,
          status: "Draft" as const,
          checkoutStatus: { checkedOut: false },
          lockStatus: { locked: false },
          lastModified: new Date().toISOString(),
          versions: [...file.versions, newVersion],
        };
      }
      return file;
    });

    const logs = state.historyLogs[fileId] || [];
    const updatedLogs = [
      ...logs,
      `[${new Date().toLocaleString()}] Checked in by ${currentUser.name}. Created new Revision`,
    ];

    return {
      files: updatedFiles,
      historyLogs: {
        ...state.historyLogs,
        [fileId]: updatedLogs,
      },
    };
  }),

  cancelCheckout: (fileId) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          checkoutStatus: { checkedOut: false },
          lockStatus: { locked: false },
          lastModified: new Date().toISOString(),
        };
      }
      return file;
    });

    const logs = state.historyLogs[fileId] || [];
    const updatedLogs = [
      ...logs,
      `[${new Date().toLocaleString()}] Checkout cancelled by ${currentUser.name}`,
    ];

    return {
      files: updatedFiles,
      historyLogs: {
        ...state.historyLogs,
        [fileId]: updatedLogs,
      },
    };
  }),

  transferLock: (fileId, targetUserId) => set((state) => {
    // Find target user
    const usersList = require("../constants/users").users; // fallback or load dynamically
    const targetUser = usersList.find((u: User) => u.id === targetUserId) || currentUser;

    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          lockStatus: {
            locked: true,
            lockedBy: targetUser,
            lockedAt: new Date().toISOString(),
          },
          checkoutStatus: file.checkoutStatus.checkedOut ? {
            ...file.checkoutStatus,
            checkedOutBy: targetUser,
            checkedOutAt: new Date().toISOString(),
          } : file.checkoutStatus,
          lastModified: new Date().toISOString(),
        };
      }
      return file;
    });

    const logs = state.historyLogs[fileId] || [];
    const updatedLogs = [
      ...logs,
      `[${new Date().toLocaleString()}] Lock transferred to ${targetUser.name} by ${currentUser.name}`,
    ];

    return {
      files: updatedFiles,
      historyLogs: {
        ...state.historyLogs,
        [fileId]: updatedLogs,
      },
    };
  }),

  lockFile: (fileId) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          lockStatus: {
            locked: true,
            lockedBy: currentUser,
            lockedAt: new Date().toISOString(),
          },
          lastModified: new Date().toISOString(),
        };
      }
      return file;
    });

    const logs = state.historyLogs[fileId] || [];
    const updatedLogs = [
      ...logs,
      `[${new Date().toLocaleString()}] File locked by ${currentUser.name}`,
    ];

    return {
      files: updatedFiles,
      historyLogs: {
        ...state.historyLogs,
        [fileId]: updatedLogs,
      },
    };
  }),

  unlockFile: (fileId) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          lockStatus: { locked: false },
          lastModified: new Date().toISOString(),
        };
      }
      return file;
    });

    const logs = state.historyLogs[fileId] || [];
    const updatedLogs = [
      ...logs,
      `[${new Date().toLocaleString()}] File unlocked by ${currentUser.name}`,
    ];

    return {
      files: updatedFiles,
      historyLogs: {
        ...state.historyLogs,
        [fileId]: updatedLogs,
      },
    };
  }),

  deleteFile: (fileId) => set((state) => ({
    files: state.files.filter((f) => f.id !== fileId),
    activeFileId: state.activeFileId === fileId ? null : state.activeFileId,
  })),

  duplicateFile: (fileId) => set((state) => {
    const fileToCopy = state.files.find((f) => f.id === fileId);
    if (!fileToCopy) return {};

    const newFile: CadFile = {
      ...fileToCopy,
      id: `cad-file-dup-${Date.now()}`,
      fileName: `Copy_of_${fileToCopy.fileName}`,
      partNumber: `${fileToCopy.partNumber}-DUP`,
      owner: currentUser,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      lockStatus: { locked: false },
      checkoutStatus: { checkedOut: false },
      comments: [],
    };

    return {
      files: [newFile, ...state.files],
    };
  }),

  moveFile: (fileId, targetFolderId) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          folderId: targetFolderId,
          lastModified: new Date().toISOString(),
        };
      }
      return file;
    });

    const folderName = state.folders.find((f) => f.id === targetFolderId)?.name || targetFolderId;
    const logs = state.historyLogs[fileId] || [];
    const updatedLogs = [
      ...logs,
      `[${new Date().toLocaleString()}] Moved to folder "${folderName}" by ${currentUser.name}`,
    ];

    return {
      files: updatedFiles,
      historyLogs: {
        ...state.historyLogs,
        [fileId]: updatedLogs,
      },
    };
  }),

  // Comments Actions
  addComment: (fileId, content) => set((state) => {
    const newComment: CadComment = {
      id: `comment-${Date.now()}`,
      author: currentUser,
      content,
      timestamp: new Date().toISOString(),
      replies: [],
      resolved: false,
    };

    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          comments: [newComment, ...file.comments],
        };
      }
      return file;
    });

    return { files: updatedFiles };
  }),

  addReply: (fileId, commentId, content) => set((state) => {
    const newReply: CadComment = {
      id: `reply-${Date.now()}`,
      author: currentUser,
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          comments: file.comments.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newReply],
              };
            }
            return c;
          }),
        };
      }
      return file;
    });

    return { files: updatedFiles };
  }),

  resolveThread: (fileId, commentId) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          comments: file.comments.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                resolved: true,
                resolvedBy: currentUser,
                resolvedAt: new Date().toISOString(),
              };
            }
            return c;
          }),
        };
      }
      return file;
    });

    return { files: updatedFiles };
  }),

  // Version Actions
  restoreVersion: (fileId, versionNumber) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        const targetVersion = file.versions.find((v) => v.version === versionNumber);
        if (!targetVersion) return file;

        // Restore version updates
        return {
          ...file,
          currentRevision: targetVersion.revision,
          status: targetVersion.status,
          size: targetVersion.size,
          lastModified: new Date().toISOString(),
        };
      }
      return file;
    });

    const logs = state.historyLogs[fileId] || [];
    const updatedLogs = [
      ...logs,
      `[${new Date().toLocaleString()}] Version ${versionNumber} restored by ${currentUser.name}`,
    ];

    return {
      files: updatedFiles,
      historyLogs: {
        ...state.historyLogs,
        [fileId]: updatedLogs,
      },
    };
  }),

  releaseModel: (fileId) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          status: "Released" as const,
          lastModified: new Date().toISOString(),
        };
      }
      return file;
    });

    const logs = state.historyLogs[fileId] || [];
    const updatedLogs = [
      ...logs,
      `[${new Date().toLocaleString()}] Model released by ${currentUser.name}`,
    ];

    return {
      files: updatedFiles,
      historyLogs: {
        ...state.historyLogs,
        [fileId]: updatedLogs,
      },
    };
  }),

  addVersion: (fileId, changeSummary) => set((state) => {
    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId) {
        const nextVerNum = file.versions.length + 1;
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nextRev = alphabet[file.versions.length % alphabet.length];

        const newVer: CadVersion = {
          version: nextVerNum,
          revision: nextRev,
          date: new Date().toISOString(),
          author: currentUser,
          changeSummary,
          status: "Draft",
          size: file.size,
        };

        return {
          ...file,
          currentRevision: nextRev,
          status: "Draft" as const,
          versions: [...file.versions, newVer],
          lastModified: new Date().toISOString(),
        };
      }
      return file;
    });

    return { files: updatedFiles };
  }),

  // Model Tree Node Visibility Actions
  togglePartVisibility: (fileId, nodeId) => set((state) => {
    const toggleNode = (nodes: CadModelNode[]): CadModelNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, visibility: !node.visibility };
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) };
        }
        return node;
      });
    };

    const updatedFiles = state.files.map((file) => {
      if (file.id === fileId && file.modelTree) {
        return {
          ...file,
          modelTree: toggleNode(file.modelTree),
        };
      }
      return file;
    });

    return { files: updatedFiles };
  }),
}));
