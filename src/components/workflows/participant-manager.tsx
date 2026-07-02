"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ParticipantRole, WorkflowParticipant } from "@/types";
import { useMemo, useState } from "react";

interface ParticipantManagerProps {
  participants: WorkflowParticipant[];
  onAdd: (name: string, role: ParticipantRole) => void;
  onRemove: (id: string) => void;
}

export function ParticipantManager({ participants, onAdd, onRemove }: ParticipantManagerProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<ParticipantRole>("Approver");
  const grouped = useMemo(
    () => ({
      Approver: participants.filter((p) => p.role === "Approver"),
      Reviewer: participants.filter((p) => p.role === "Reviewer"),
      Observer: participants.filter((p) => p.role === "Observer"),
    }),
    [participants]
  );
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold">Participants</h3>
      {(["Approver", "Reviewer", "Observer"] as ParticipantRole[]).map((group) => (
        <div key={group}>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{group}s</p>
          <div className="mt-1 space-y-1">
            {grouped[group].map((participant) => (
              <div key={participant.id} className="flex items-center justify-between rounded border px-2 py-1.5 text-sm">
                <span>{participant.name}</span>
                <Button size="sm" variant="ghost" onClick={() => onRemove(participant.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-3 gap-2">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as ParticipantRole)}
          className="h-9 rounded-md border px-2 text-sm"
        >
          <option value="Approver">Approver</option>
          <option value="Reviewer">Reviewer</option>
          <option value="Observer">Observer</option>
        </select>
        <Button
          onClick={() => {
            if (!name.trim()) return;
            onAdd(name.trim(), role);
            setName("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
