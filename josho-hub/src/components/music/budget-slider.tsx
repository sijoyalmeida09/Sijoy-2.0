"use client";

interface BudgetSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function BudgetSlider({ min, max, value, onChange, label }: BudgetSliderProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-medium text-blue-200">{label}</label>}
      <input
        type="range"
        min={min}
        max={max}
        step={500}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-blue-900/60 accent-joshoBlue"
      />
      <div className="flex justify-between text-xs text-blue-300">
        <span>&#8377;{min.toLocaleString("en-IN")}</span>
        <span className="font-semibold text-white">&#8377;{value.toLocaleString("en-IN")}</span>
        <span>&#8377;{max.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
