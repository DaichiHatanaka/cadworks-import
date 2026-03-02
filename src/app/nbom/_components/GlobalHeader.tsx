"use client";

import Link from "next/link";

export default function GlobalHeader({ jobNo }: { jobNo: string }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          N-BOM
        </Link>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {jobNo}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">v1.0</span>
      </div>
    </header>
  );
}
