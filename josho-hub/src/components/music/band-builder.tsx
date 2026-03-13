"use client";

import { useState } from "react";

interface BandMember {
  artistId: string;
  stageName: string;
  instrument: string;
  eventRate: number;
  profilePhoto: string | null;
}

interface BandBuilderProps {
  recommendations: BandMember[];
  budget: number;
  onSelectionChange: (selected: BandMember[]) => void;
}

export function BandBuilder({ recommendations, budget, onSelectionChange }: BandBuilderProps) {
  const [selected, setSelected] = useState<BandMember[]>([]);

  const totalCost = selected.reduce((sum, m) => sum + m.eventRate, 0);
  const overBudget = totalCost > budget;

  function toggle(member: BandMember) {
    const exists = selected.find((s) => s.artistId === member.artistId);
    const next = exists ? selected.filter((s) => s.artistId !== member.artistId) : [...selected, member];
    setSelected(next);
    onSelectionChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-200">Build Your Band</h3>
        <div className={`text-sm font-bold ${overBudget ? "text-red-400" : "text-green-400"}`}>
          &#8377;{totalCost.toLocaleString("en-IN")} / &#8377;{budget.toLocaleString("en-IN")}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {recommendations.map((member) => {
          const isSelected = selected.some((s) => s.artistId === member.artistId);
          return (
            <button
              key={member.artistId}
              type="button"
              onClick={() => toggle(member)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all ${
                isSelected
                  ? "border-joshoBlue bg-joshoBlue/10 shadow-md"
                  : "border-blue-900/30 bg-[#13213d] hover:border-blue-700/50"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#0d1a30]">
                {member.profilePhoto ? (
                  <img src={member.profilePhoto} alt={member.stageName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl text-blue-600">{member.stageName.charAt(0)}</span>
                )}
              </div>
              <p className="text-sm font-medium text-white">{member.stageName}</p>
              <p className="text-[10px] uppercase tracking-wide text-blue-300">{member.instrument}</p>
              <p className="text-xs font-semibold text-blue-100">&#8377;{member.eventRate.toLocaleString("en-IN")}</p>
              {isSelected && <span className="text-[10px] font-bold text-joshoBlue">ADDED</span>}
            </button>
          );
        })}
      </div>

      {overBudget && (
        <p className="text-xs text-red-400">
          Over budget by &#8377;{(totalCost - budget).toLocaleString("en-IN")}. Remove a member or increase your budget.
        </p>
      )}
    </div>
  );
}
