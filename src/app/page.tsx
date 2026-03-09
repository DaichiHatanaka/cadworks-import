"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveWorkspaceParams } from "@/lib/workspace-params";

const INPUT_BASE =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function Home() {
  const router = useRouter();

  // 共通工番
  const [jobNo, setJobNo] = useState("FULL-TEST-001");

  // リセット状態管理
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleReset = useCallback(async () => {
    const trimmed = jobNo.trim();
    if (!trimmed) return;

    if (
      !window.confirm(
        `工番「${trimmed}」の全データをリセットしますか？\n（インポートデータ・紐付け結果・N-BOM データ等がすべて削除されます）`,
      )
    ) {
      return;
    }

    setResetting(true);
    setResetMessage(null);

    try {
      const res = await fetch("/api/jobs/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobNo: trimmed }),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        const total = Object.values(result.deletedCounts as Record<string, number>).reduce(
          (a, b) => a + b,
          0,
        );
        setResetMessage({ type: "success", text: `リセット完了（${total}件削除）` });
      } else {
        setResetMessage({ type: "error", text: result.error || "リセットに失敗しました" });
      }
    } catch {
      setResetMessage({ type: "error", text: "リセット中にエラーが発生しました" });
    } finally {
      setResetting(false);
    }
  }, [jobNo]);

  // Step 3（マスター作成）追加フィールド
  const [caseNo, setCaseNo] = useState("A");
  const [constructionType, setConstructionType] = useState("新築");
  const [listTypes, setListTypes] = useState("標準");

  const hasJobNo = jobNo.trim().length > 0;
  const hasAllMatchingFields =
    hasJobNo &&
    caseNo.trim().length > 0 &&
    constructionType.trim().length > 0 &&
    listTypes.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">CADWorks Import</h1>
          <p className="mt-2 text-sm text-gray-500">CAD と T-BOM データを管理・紐づけるツール</p>
        </div>

        {/* 共通工番入力 */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <label className="block text-sm font-semibold text-gray-700">
            工番
            <span className="ml-1 text-xs font-normal text-gray-400">
              （各ステップで共通して使用します）
            </span>
          </label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={jobNo}
              onChange={(e) => {
                setJobNo(e.target.value);
                setResetMessage(null);
              }}
              placeholder="例: 2024-001"
              className={`${INPUT_BASE} flex-1 py-2.5 text-base`}
            />
            <button
              onClick={handleReset}
              disabled={!hasJobNo || resetting}
              className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
            >
              {resetting ? "リセット中..." : "データリセット"}
            </button>
          </div>
          {resetMessage && (
            <p
              className={`mt-2 text-sm ${resetMessage.type === "success" ? "text-green-700" : "text-red-700"}`}
            >
              {resetMessage.text}
            </p>
          )}
        </div>

        {/* フロー区切り */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">
            業務フロー
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* 4ステップカード */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Step 1: インポート */}
          <StepCard
            step={1}
            title="データインポート"
            description="CAD または T-BOM データの CSV ファイルを取り込みます。マスター作成前に必ず実施してください。"
            color="blue"
            enabled
            buttonLabel="インポート画面へ"
            onStart={() => router.push("/import")}
          />

          {/* Step 2: 機器分割 */}
          <StepCard
            step={2}
            title="機器分割"
            description="T-BOM で数量 2 以上の機器を 1 台ずつに分割します。マスター作成前の必須作業です。"
            color="orange"
            enabled={hasJobNo}
            disabledReason="工番を入力してください"
            buttonLabel="機器分割を開始"
            onStart={() => {
              saveWorkspaceParams({ jobNo: jobNo.trim() });
              router.push(`/splitting?jobNo=${encodeURIComponent(jobNo.trim())}`);
            }}
          />

          {/* Step 3: マスター作成 */}
          <StepCard
            step={3}
            title="マスター作成"
            description="CAD データと T-BOM データを紐づけます。追加情報を入力してから開始してください。"
            color="green"
            enabled={hasAllMatchingFields}
            disabledReason="全項目を入力してください"
            buttonLabel="マスター作成を開始"
            onStart={() => {
              const trimmed = {
                jobNo: jobNo.trim(),
                caseNo: caseNo.trim(),
                constructionType: constructionType.trim(),
                listTypes: listTypes.trim(),
              };
              saveWorkspaceParams(trimmed);
              router.push(`/matching?${new URLSearchParams(trimmed).toString()}`);
            }}
            extraFields={
              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    ケース <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={caseNo}
                    onChange={(e) => setCaseNo(e.target.value)}
                    placeholder="例: A"
                    className={INPUT_BASE}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    施工区分 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={constructionType}
                    onChange={(e) => setConstructionType(e.target.value)}
                    placeholder="例: 新築"
                    className={INPUT_BASE}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    リストタイプ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={listTypes}
                    onChange={(e) => setListTypes(e.target.value)}
                    placeholder="例: 標準"
                    className={INPUT_BASE}
                  />
                </div>
              </div>
            }
          />
          {/* Step 4: N-BOM メイン画面 */}
          <StepCard
            step={4}
            title="メイン画面 (N-BOM)"
            description="マスター作成完了後の機器積算メイン画面。属性タグベースで多次元ビュー切替・インライン編集が可能です。"
            color="purple"
            enabled={hasJobNo}
            disabledReason="工番を入力してください"
            buttonLabel="N-BOM を開く"
            onStart={() => {
              saveWorkspaceParams({ jobNo: jobNo.trim() });
              router.push(`/nbom?jobNo=${encodeURIComponent(jobNo.trim())}`);
            }}
          />
        </div>

        {/* フッター注釈 */}
        <p className="mt-6 text-center text-xs text-gray-400">
          通常の業務フローは Step 1 → Step 2 → Step 3 → Step 4 の順に実施します。
        </p>
      </div>
    </div>
  );
}

// --- StepCard コンポーネント ---

const colorMap = {
  blue: {
    badge: "bg-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
    border: "border-blue-100",
  },
  orange: {
    badge: "bg-orange-500",
    button: "bg-orange-500 hover:bg-orange-600",
    border: "border-orange-100",
  },
  green: {
    badge: "bg-green-600",
    button: "bg-green-600 hover:bg-green-700",
    border: "border-green-100",
  },
  purple: {
    badge: "bg-purple-600",
    button: "bg-purple-600 hover:bg-purple-700",
    border: "border-purple-100",
  },
} as const;

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  color: keyof typeof colorMap;
  enabled: boolean;
  disabledReason?: string;
  buttonLabel: string;
  onStart: () => void;
  extraFields?: React.ReactNode;
}

function StepCard({
  step,
  title,
  description,
  color,
  enabled,
  disabledReason,
  buttonLabel,
  onStart,
  extraFields,
}: StepCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${enabled ? c.border : "border-gray-100"}`}
    >
      {/* ステップバッジ */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${c.badge}`}
        >
          {step}
        </span>
        <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Step {step}
        </span>
      </div>

      {/* タイトル・説明 */}
      <h2 className="mb-1 text-base font-bold text-gray-900">{title}</h2>
      <p className="flex-1 text-xs leading-relaxed text-gray-500">{description}</p>

      {/* 追加フィールド（Step 3 用） */}
      {extraFields}

      {/* ボタン */}
      <div className="mt-4">
        {!enabled && disabledReason && (
          <p className="mb-1.5 text-xs text-gray-400">{disabledReason}</p>
        )}
        <button
          onClick={onStart}
          disabled={!enabled}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 ${enabled ? c.button : ""}`}
        >
          {buttonLabel} →
        </button>
      </div>
    </div>
  );
}
