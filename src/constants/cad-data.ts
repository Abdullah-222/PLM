import type { CadFile, CadFolder, CadModelNode, CadVersion, CadComment } from "@/types/cad";
import { users } from "./users";

// 10 folders
export const initialFolders: CadFolder[] = [
  { id: "f-1", name: "Engineering", parentId: null },
  { id: "f-2", name: "Mechanical", parentId: "f-1" },
  { id: "f-3", name: "Engine", parentId: "f-2" },
  { id: "f-4", name: "Gearbox", parentId: "f-2" },
  { id: "f-5", name: "Electrical", parentId: "f-1" },
  { id: "f-6", name: "Battery", parentId: "f-5" },
  { id: "f-7", name: "Wiring", parentId: "f-5" },
  { id: "f-8", name: "Manufacturing", parentId: null },
  { id: "f-9", name: "Released", parentId: null },
  { id: "f-10", name: "Archive", parentId: null },
];

// Helper to generate a random 3D color
const getPartColor = (index: number) => {
  const colors = [
    "#94a3b8", "#cbd5e1", "#64748b", "#334155", // slate shades
    "#f87171", "#fb923c", "#fbbf24", "#34d399", // warm & cool
    "#60a5fa", "#818cf8", "#a78bfa", "#f472b6",
  ];
  return colors[index % colors.length];
};

// Generate 120 parts across 15 assemblies
// We will assign them unique names, materials, weights, and nodes.
let partCounter = 1;
const generateSubparts = (count: number, assemblyName: string): CadModelNode[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = `part-node-${partCounter++}`;
    const partNum = `PART-${1000 + partCounter}`;
    const weightVal = (Math.random() * 5 + 0.1).toFixed(2);
    const materials = ["Aluminum 6061-T6", "Titanium Grade 5", "Stainless Steel 316", "Inconel 718", "Carbon Fiber Composite", "Copper C101"];
    const material = materials[i % materials.length];

    return {
      id,
      name: `${assemblyName} Part ${i + 1} (${partNum})`,
      type: "part" as const,
      material,
      weight: `${weightVal} kg`,
      color: getPartColor(partCounter),
      visibility: true,
    };
  });
};

// Generate 15 assemblies
const assemblies: { id: string; name: string; tree: CadModelNode[] }[] = [];
const subassemblyNames = [
  "Turbofan Compressor", "Turbofan Combustor", "Turbofan Turbine", "Turbofan Fan Section",
  "Gearbox Housing Subassy", "Gearbox Shaft Subassy", "Gearbox Differential Group",
  "Battery Module Housing", "Battery Cells Stack", "Battery Management PCB Layout",
  "Main Cabin Wiring Harness", "Avionics Rack Mounting Stack", "Hydraulic Cylinder Assy",
  "Brake Caliper Piston Block", "Wing Spar Connection Flange"
];

subassemblyNames.forEach((name, index) => {
  const assyId = `assy-${index + 1}`;
  const partsCount = 8; // 15 assemblies * 8 parts = 120 parts total!
  const subparts = generateSubparts(partsCount, name);

  assemblies.push({
    id: assyId,
    name,
    tree: [
      {
        id: `assy-root-${index + 1}`,
        name: `${name} Assembly`,
        type: "assembly" as const,
        children: subparts,
        color: getPartColor(index),
        visibility: true,
      }
    ]
  });
});

// Generate 8+ Revisions for key files
const generateVersionsList = (fileName: string, startRev: string, count: number): CadVersion[] => {
  const revs = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const startIndex = revs.indexOf(startRev);
  const versions: CadVersion[] = [];

  for (let i = 0; i < count; i++) {
    const rev = revs[(startIndex + i) % revs.length];
    const daysAgo = (count - i) * 30;
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    versions.push({
      version: i + 1,
      revision: rev,
      date,
      author: users[i % users.length],
      changeSummary: i === 0 ? "Initial design concept check-in" : `Incorporated modifications for Rev ${rev} per ECR-${2026 - i}-01`,
      status: i === count - 1 ? "Released" : "Obsolete",
      size: `${(50 + (i * 12.3)).toFixed(1)} MB`
    });
  }

  return versions;
};

// Comments generator
const generateComments = (fileId: string): CadComment[] => {
  return [
    {
      id: `c-${fileId}-1`,
      author: users[1], // James Wilson
      content: "I ran a FEA stress analysis on the mounting tabs. They seem slightly thin. Can we increase the fillet radius to 3.0mm?",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      resolved: false,
      replies: [
        {
          id: `c-${fileId}-1-r1`,
          author: users[0], // Sarah Chen
          content: "Good catch, James! I'll update the CAD parameters in the next revision to increase the fillet to 3.2mm for extra clearance as well.",
          timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: `c-${fileId}-1-r2`,
          author: users[3], // Alex Kim
          content: "From manufacturing side, 3.2mm fillet is perfect. Standard tooling will support this without custom setups.",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: `c-${fileId}-2`,
      author: users[2], // Maria Garcia
      content: "Has the material datasheet been linked? We need the certified Inconel specs for quality sign-off.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      resolved: true,
      resolvedBy: users[0],
      resolvedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
      replies: [
        {
          id: `c-${fileId}-2-r1`,
          author: users[0],
          content: "Yes Maria, linked the datasheet under the relationships tab. It references DOC-MAT-9981.",
          timestamp: new Date(Date.now() - 0.8 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  ];
};

// Let's create the 40 main CAD files.
// Softwares: SolidWorks, CATIA, PTC Creo, Siemens NX, AutoCAD, Autodesk Inventor, Neutral
// Extensions: SLDPRT, SLDASM, STEP, STP, IGES, CATPART, CATPRODUCT, PRT, DWG, DXF, PDF
export const initialCadFiles: CadFile[] = [];

const fileDefinitions = [
  // Folder: Engine (f-3) - 6 files
  { name: "Turbofan_Engine_Assembly", ext: "SLDASM", soft: "SolidWorks", folder: "f-3", isAssy: true, assyIdx: 0, prodId: "prod-001" },
  { name: "Compressor_Stator_Vanes", ext: "SLDPRT", soft: "SolidWorks", folder: "f-3", isAssy: false, prodId: "prod-012" },
  { name: "High_Pressure_Turbine_Blade", ext: "CATPART", soft: "CATIA", folder: "f-3", isAssy: false, prodId: "prod-012" },
  { name: "Combustion_Chamber_Liner", ext: "STEP", soft: "Neutral", folder: "f-3", isAssy: false, prodId: "prod-001" },
  { name: "Engine_Nacelle_Fairing", ext: "IGES", soft: "Neutral", folder: "f-3", isAssy: false },
  { name: "Fuel_Nozzle_Manifold", ext: "PRT", soft: "PTC Creo", folder: "f-3", isAssy: false },

  // Folder: Gearbox (f-4) - 6 files
  { name: "Main_Gearbox_Assembly", ext: "CATPRODUCT", soft: "CATIA", folder: "f-4", isAssy: true, assyIdx: 4 },
  { name: "Input_Shaft_Pinion", ext: "CATPART", soft: "CATIA", folder: "f-4", isAssy: false },
  { name: "Planetary_Carrier_Housing", ext: "STEP", soft: "Neutral", folder: "f-4", isAssy: false },
  { name: "Gearbox_Oil_Pan_Seal", ext: "SLDPRT", soft: "SolidWorks", folder: "f-4", isAssy: false },
  { name: "Splined_Coupling_Flange", ext: "PRT", soft: "Siemens NX", folder: "f-4", isAssy: false },
  { name: "Gearbox_Housing_Cast_Model", ext: "IGES", soft: "Neutral", folder: "f-4", isAssy: false },

  // Folder: Battery (f-6) - 5 files
  { name: "Li-Ion_Battery_Pack_Assy", ext: "SLDASM", soft: "SolidWorks", folder: "f-6", isAssy: true, assyIdx: 7, prodId: "prod-002" },
  { name: "Battery_Thermal_Plate", ext: "SLDPRT", soft: "SolidWorks", folder: "f-6", isAssy: false, prodId: "prod-002" },
  { name: "Cell_Busbar_Connector", ext: "STEP", soft: "Neutral", folder: "f-6", isAssy: false },
  { name: "Insulation_Barrier_Film", ext: "DXF", soft: "AutoCAD", folder: "f-6", isAssy: false },
  { name: "Battery_Enclosure_Cover", ext: "PRT", soft: "PTC Creo", folder: "f-6", isAssy: false },

  // Folder: Wiring (f-7) - 5 files
  { name: "Cabin_Power_Harness_Layout", ext: "DWG", soft: "AutoCAD", folder: "f-7", isAssy: false, prodId: "prod-011" },
  { name: "Avionics_Bus_Wiring_Diagram", ext: "PDF", soft: "Neutral", folder: "f-7", isAssy: false, prodId: "prod-004" },
  { name: "Connector_Plug_Amphenol", ext: "STEP", soft: "Neutral", folder: "f-7", isAssy: false },
  { name: "Wiring_Grommet_Rubber", ext: "SLDPRT", soft: "SolidWorks", folder: "f-7", isAssy: false },
  { name: "Wire_Shielding_Mesh", ext: "IGES", soft: "Neutral", folder: "f-7", isAssy: false },

  // Folder: Manufacturing (f-8) - 6 files
  { name: "Hydraulic_Pump_Machining_Fixture", ext: "SLDASM", soft: "SolidWorks", folder: "f-8", isAssy: true, assyIdx: 12, prodId: "prod-003" },
  { name: "Drill_Template_Flange", ext: "SLDPRT", soft: "SolidWorks", folder: "f-8", isAssy: false },
  { name: "Casting_Core_Sand_Mold", ext: "STEP", soft: "Neutral", folder: "f-8", isAssy: false },
  { name: "Sheetmetal_Bending_Flat_Pattern", ext: "DXF", soft: "AutoCAD", folder: "f-8", isAssy: false },
  { name: "Milling_Setup_Drawing", ext: "PDF", soft: "Neutral", folder: "f-8", isAssy: false },
  { name: "Clamping_Fixture_Jaw", ext: "PRT", soft: "Siemens NX", folder: "f-8", isAssy: false },

  // Folder: Released (f-9) - 6 files
  { name: "Landing_Gear_Shock_Strut_Assy", ext: "SLDASM", soft: "SolidWorks", folder: "f-9", isAssy: true, assyIdx: 1, prodId: "prod-010" },
  { name: "Main_Landing_Gear_Wheel_Hub", ext: "PRT", soft: "PTC Creo", folder: "f-9", isAssy: false, prodId: "prod-008" },
  { name: "Hydraulic_Actuator_Cylinder", ext: "STEP", soft: "Neutral", folder: "f-9", isAssy: false },
  { name: "Strut_Lower_Torque_Link", ext: "CATPART", soft: "CATIA", folder: "f-9", isAssy: false, prodId: "prod-010" },
  { name: "Wing_Spar_Splice_Plate", ext: "STEP", soft: "Neutral", folder: "f-9", isAssy: false, prodId: "prod-006" },
  { name: "Fuel_Line_Disconnect_Valves", ext: "CATPART", soft: "CATIA", folder: "f-9", isAssy: false, prodId: "prod-005" },

  // Folder: Archive (f-10) - 6 files
  { name: "Obsolete_Turbine_Blade_V1", ext: "SLDPRT", soft: "SolidWorks", folder: "f-10", isAssy: false },
  { name: "Archived_ECU_Mounting_Bracket", ext: "PRT", soft: "Siemens NX", folder: "f-10", isAssy: false },
  { name: "Prototype_Battery_Cell_Holder", ext: "STEP", soft: "Neutral", folder: "f-10", isAssy: false },
  { name: "Old_Cabin_Air_Ducting_Layout", ext: "DWG", soft: "AutoCAD", folder: "f-10", isAssy: false },
  { name: "Retired_Fuel_Filter_Housing", ext: "IGES", soft: "Neutral", folder: "f-10", isAssy: false },
  { name: "Archived_Drawing_Index_Sheet", ext: "PDF", soft: "Neutral", folder: "f-10", isAssy: false }
];

// Let's build the list of 40 items. We'll add some generic items to reach exactly 40 files
while (fileDefinitions.length < 40) {
  const idx = fileDefinitions.length;
  fileDefinitions.push({
    name: `Spare_Engineering_Part_${idx}`,
    ext: "STEP",
    soft: "Neutral",
    folder: "f-2",
    isAssy: false,
    assyIdx: undefined,
    prodId: undefined
  });
}

// Generate the final list of 40 files
fileDefinitions.forEach((def, index) => {
  const id = `cad-file-${index + 1}`;
  const partNumber = `PN-CAD-${3000 + index}`;
  const lifecycleStates: ("Draft" | "In Review" | "Released" | "Obsolete" | "Frozen" | "Archived")[] = [
    "Released", "In Review", "Draft", "Released", "Obsolete", "Draft"
  ];
  const status = def.folder === "f-9" ? "Released" : def.folder === "f-10" ? "Archived" : lifecycleStates[index % lifecycleStates.length];
  
  // Set lock & checkout states
  const isLocked = index % 5 === 0;
  const isCheckedOut = index % 7 === 0 && !isLocked;
  const lockStatus = {
    locked: isLocked,
    lockedBy: isLocked ? users[index % users.length] : undefined,
    lockedAt: isLocked ? new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() : undefined
  };
  const checkoutStatus = {
    checkedOut: isCheckedOut,
    checkedOutBy: isCheckedOut ? users[(index + 1) % users.length] : undefined,
    checkedOutAt: isCheckedOut ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() : undefined,
    reason: isCheckedOut ? "Updating thread parameters and weight calculations per engineering request." : undefined
  };

  // Revisions count (up to 8 revisions)
  const revCount = (index % 5) + 3; // 3 to 7 revisions
  const versions = generateVersionsList(`${def.name}.${def.ext.toLowerCase()}`, "A", revCount);
  const currentRevision = versions[versions.length - 1].revision;

  // Assembly model tree
  let modelTree: CadModelNode[] | undefined;
  if (def.isAssy && def.assyIdx !== undefined && assemblies[def.assyIdx]) {
    modelTree = assemblies[def.assyIdx].tree;
  } else {
    // Simple 1-level tree for part
    modelTree = [
      {
        id: `tree-root-${id}`,
        name: `${def.name} Solid Body`,
        type: "part",
        material: "Aluminum 7075-T6",
        weight: "1.25 kg",
        color: "#cbd5e1",
        visibility: true
      }
    ];
  }

  // Linked relationships
  const linkedProduct = def.prodId ? {
    id: def.prodId,
    name: def.prodId === "prod-001" ? "Engine Assembly" : def.prodId === "prod-002" ? "Battery Module" : "Landing Gear Strut",
    partNumber: def.prodId === "prod-001" ? "ITEM-1001" : def.prodId === "prod-002" ? "ITEM-1002" : "ITEM-1010"
  } : undefined;

  const linkedDocuments = [
    { id: `doc-lnk-${index}-1`, name: `${def.name}_Specification.pdf`, type: "PDF" },
    { id: `doc-lnk-${index}-2`, name: `Material_Datasheet_${partNumber}.pdf`, type: "PDF" }
  ];

  const linkedChanges = index % 3 === 0 ? [
    { id: "ECR-2026-042", title: "Update Turbine Blade Coating Specification", status: "In Progress" }
  ] : undefined;

  const linkedWorkflows = index % 4 === 0 ? [
    { id: "wf-101", name: "Engineering Release Workflow", status: "In Progress" }
  ] : undefined;

  initialCadFiles.push({
    id,
    fileName: `${def.name}.${def.ext.toLowerCase()}`,
    thumbnail: "", // Will render dynamic thumbnail component based on extension
    type: def.ext as any,
    software: def.soft as any,
    currentRevision,
    status,
    owner: users[index % users.length],
    lastModified: versions[versions.length - 1].date,
    createdAt: versions[0].date,
    size: versions[versions.length - 1].size,
    lockStatus,
    checkoutStatus,
    folderId: def.folder,
    description: `High-fidelity engineering 3D CAD model file for ${def.name.replace(/_/g, " ")}. Designed and simulated for structural integrity.`,
    material: index % 2 === 0 ? "Titanium Grade 5" : "Aluminum 7075-T6",
    weight: `${(index * 0.85 + 0.55).toFixed(2)} kg`,
    volume: `${(index * 220 + 150).toFixed(0)} cm³`,
    density: "4.43 g/cm³",
    surfaceArea: `${(index * 12 + 45).toFixed(1)} cm²`,
    units: "mm / kg / sec",
    partNumber,
    project: index % 2 === 0 ? "Turbine Assembly X200" : "Landing Gear Gen5",
    tags: [def.ext.toLowerCase(), def.soft.toLowerCase(), "cad", "plm"],
    linkedProduct,
    linkedRevision: `REV-${currentRevision}`,
    linkedDocuments,
    linkedBomId: def.isAssy ? `bom-${id}` : undefined,
    linkedChanges,
    linkedWorkflows,
    versions,
    modelTree,
    comments: generateComments(id)
  });
});
