"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface JobNavigatorProps {
  currentJobNo: string;
}

export default function JobNavigator({ currentJobNo }: JobNavigatorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  if (collapsed) {
    return (
      <div className="flex w-10 shrink-0 flex-col items-center border-r border-gray-200 bg-white py-3">
        <button
          onClick={() => setCollapsed(false)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="JOBナビゲーターを開く"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">MyJOB</span>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* 検索 */}
      <div className="px-3 py-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="工番を検索..."
          className="w-full rounded border border-gray-200 px-2 py-1 text-xs placeholder:text-gray-400 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* お気に入り */}
      <div className="px-3 py-1">
        <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
          お気に入り
        </span>
      </div>

      {/* 現在の工番 */}
      <div className="flex-1 overflow-y-auto px-1">
        <div className="px-2 py-1">
          <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
            現在の工番
          </span>
        </div>
        <button
          className={cn(
            "w-full rounded px-2 py-1.5 text-left text-xs",
            "bg-blue-50 font-medium text-blue-700",
          )}
        >
          {currentJobNo}
        </button>
      </div>
    </aside>
  );
}
