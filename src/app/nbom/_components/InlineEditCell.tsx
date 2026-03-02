"use client";

import { useState, useRef, useEffect } from "react";

interface InlineEditCellProps {
  initialValue: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
  align?: "left" | "right";
}

export default function InlineEditCell({
  initialValue,
  onCommit,
  onCancel,
  align = "left",
}: InlineEditCellProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onCommit(value);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onCommit(value)}
      className="w-full rounded border border-blue-400 bg-white px-1 py-0 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none"
      style={{ textAlign: align }}
    />
  );
}
