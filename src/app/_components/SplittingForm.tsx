"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SplittingForm() {
  const router = useRouter();
  const [jobNo, setJobNo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobNo.trim()) return;
    router.push(`/splitting?jobNo=${encodeURIComponent(jobNo.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor="splitting-jobNo" className="mb-1 block text-sm font-medium text-gray-700">
          工番
        </label>
        <input
          id="splitting-jobNo"
          type="text"
          value={jobNo}
          onChange={(e) => setJobNo(e.target.value)}
          placeholder="例: 2024-001"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          required
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        disabled={!jobNo.trim()}
      >
        機器分割を開始
      </button>
    </form>
  );
}
