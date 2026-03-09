"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { loadWorkspaceParams, type WorkspaceParams } from "@/lib/workspace-params";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  requiresJobNo?: boolean;
  requiresAllParams?: boolean;
}

interface AppSideMenuProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppSideMenu({ collapsed, onToggle }: AppSideMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const savedParams: WorkspaceParams | null = loadWorkspaceParams();

  // URL > sessionStorage の優先順位でパラメータを取得
  const getParam = (key: keyof WorkspaceParams): string | null => {
    return searchParams.get(key) || savedParams?.[key] || null;
  };

  const effectiveJobNo = getParam("jobNo");

  // 各ページに必要なパラメータ付き href を構築。パラメータ不足時は null
  const buildHref = (item: MenuItem): string | null => {
    const { path } = item;
    if (path === "/" || path === "/import") return path;

    const jobNo = effectiveJobNo;
    if (!jobNo) return null;

    if (path === "/splitting" || path === "/nbom") {
      return `${path}?jobNo=${encodeURIComponent(jobNo)}`;
    }

    if (path === "/matching") {
      const caseNo = getParam("caseNo");
      const constructionType = getParam("constructionType");
      const listTypes = getParam("listTypes");
      if (!caseNo || !constructionType || !listTypes) return null;
      const params = new URLSearchParams({
        jobNo,
        caseNo,
        constructionType,
        listTypes,
      });
      return `/matching?${params.toString()}`;
    }

    return path;
  };

  const isActive = (itemPath: string) => {
    if (itemPath === "/") return pathname === "/";
    return pathname.startsWith(itemPath);
  };

  const menuItems: MenuItem[] = [
    {
      path: "/",
      label: "ホーム",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      path: "/import",
      label: "インポート",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      path: "/splitting",
      label: "機器分割",
      requiresJobNo: true,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v16m6-16v16M4 8h16M4 16h16" />
        </svg>
      ),
    },
    {
      path: "/matching",
      label: "マスター作成",
      requiresJobNo: true,
      requiresAllParams: true,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
    },
    {
      path: "/nbom",
      label: "N-BOM",
      requiresJobNo: true,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
  ];

  // --- 折りたたみ表示 ---
  if (collapsed) {
    return (
      <nav
        className="fixed top-0 left-0 z-40 flex h-screen w-16 flex-col items-center border-r border-gray-200 bg-white py-4 transition-all duration-300"
        aria-label="メインナビゲーション"
      >
        <button
          onClick={onToggle}
          className="mb-4 rounded p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="メニューを展開"
          aria-expanded="false"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* 工番バッジ（折りたたみ時） */}
        {effectiveJobNo && (
          <div className="mb-3 px-1" title={`工番: ${effectiveJobNo}`}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-[10px] font-bold text-blue-600">
              工番
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const href = buildHref(item);
            const disabled = href === null;
            const active = isActive(item.path);

            if (disabled) {
              return (
                <span
                  key={item.path}
                  className="cursor-not-allowed rounded-lg p-3 text-gray-300"
                  title={`${item.label}（ホームから工番を選択してください）`}
                  aria-disabled="true"
                >
                  {item.icon}
                </span>
              );
            }

            return (
              <Link
                key={item.path}
                href={href}
                className={cn(
                  "rounded-lg p-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                title={item.label}
              >
                {item.icon}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // --- 展開表示 ---
  return (
    <nav
      className="fixed top-0 left-0 z-40 flex h-screen w-56 flex-col border-r border-gray-200 bg-white transition-all duration-300"
      aria-label="メインナビゲーション"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-900">CADWorks Import</h2>
        <button
          onClick={onToggle}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="メニューを折りたたむ"
          aria-expanded="true"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* 工番表示 */}
      {effectiveJobNo && (
        <div className="border-b border-gray-100 px-4 py-2.5">
          <p className="truncate text-xs text-gray-400">
            工番: <span className="font-medium text-gray-600">{effectiveJobNo}</span>
          </p>
        </div>
      )}

      {/* メニュー項目 */}
      <div className="flex flex-col gap-1 p-3">
        {menuItems.map((item) => {
          const href = buildHref(item);
          const disabled = href === null;
          const active = isActive(item.path);

          if (disabled) {
            return (
              <span
                key={item.path}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300"
                title="ホームから工番を選択してください"
                aria-disabled="true"
              >
                {item.icon}
                <span>{item.label}</span>
              </span>
            );
          }

          return (
            <Link
              key={item.path}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none",
                active ? "bg-blue-50 font-medium text-blue-700" : "text-gray-700 hover:bg-gray-50",
              )}
              aria-current={active ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
