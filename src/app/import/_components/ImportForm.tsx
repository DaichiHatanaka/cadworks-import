/**
 * CSV Import Form Component
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CsvRecord, DataType, ValidationError, ValidationWarning } from "@/lib/csv/types";
import { PreviewTable } from "./PreviewTable";
import { ValidationErrors } from "./ValidationErrors";

type ImportState = "initial" | "parsing" | "preview" | "executing" | "success" | "error";

export function ImportForm() {
  const router = useRouter();
  const [state, setState] = useState<ImportState>("initial");
  const [dataType, setDataType] = useState<DataType>("cad");
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CsvRecord[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [jobNo, setJobNo] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Reset state when new file is selected
      setState("initial");
      setPreviewData([]);
      setErrors([]);
      setWarnings([]);
      setErrorMessage("");
    }
  };

  const handleParse = async () => {
    if (!file) {
      setErrorMessage("ファイルを選択してください");
      return;
    }

    setState("parsing");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dataType", dataType);

      const response = await fetch("/api/import/parse", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setPreviewData(result.validRows);
        setErrors(result.errors);
        setWarnings(result.warnings);
        setState("preview");

        // Extract jobNo from first valid row
        if (result.validRows.length > 0) {
          setJobNo(result.validRows[0].jobNo);
        }
      } else {
        setErrorMessage(result.error || "解析に失敗しました");
        setState("error");
      }
    } catch (error) {
      console.error("Parse error:", error);
      setErrorMessage("解析中にエラーが発生しました");
      setState("error");
    }
  };

  const handleExecute = async () => {
    if (previewData.length === 0 || !jobNo) {
      setErrorMessage("インポートするデータがありません");
      return;
    }

    if (errors.length > 0) {
      setErrorMessage("エラーを修正してからインポートしてください");
      return;
    }

    setState("executing");
    setErrorMessage("");

    try {
      const response = await fetch("/api/import/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataType,
          jobNo,
          rows: previewData,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setState("success");
      } else if (response.status === 409) {
        setErrorMessage(result.error || "データが既に存在します");
        setState("preview");
      } else {
        setErrorMessage(result.error || "インポートに失敗しました");
        setState("error");
      }
    } catch (error) {
      console.error("Execute error:", error);
      setErrorMessage("インポート中にエラーが発生しました");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("initial");
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setWarnings([]);
    setJobNo("");
    setErrorMessage("");
  };

  // Success view
  if (state === "success") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h2 className="mb-2 text-2xl font-bold text-green-900">インポート完了</h2>
          <p className="mb-6 text-green-800">{previewData.length}件のデータをインポートしました</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-gray-600 px-6 py-2 font-medium text-white hover:bg-gray-700"
            >
              ホームへ戻る
            </button>
            <button
              onClick={() => router.push("/matching")}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
            >
              マッチング画面へ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: File Selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Step 1: ファイル選択</h2>

        <div className="space-y-4">
          {/* Data Type Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">データタイプ</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dataType"
                  value="cad"
                  checked={dataType === "cad"}
                  onChange={(e) => setDataType(e.target.value as DataType)}
                  disabled={state !== "initial"}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">CADデータ</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dataType"
                  value="tbom"
                  checked={dataType === "tbom"}
                  onChange={(e) => setDataType(e.target.value as DataType)}
                  disabled={state !== "initial"}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">T-BOMデータ</span>
              </label>
            </div>
          </div>

          {/* File Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">CSVファイル</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={state === "parsing" || state === "executing"}
              className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                選択中: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Parse Button */}
          <button
            onClick={handleParse}
            disabled={!file || state === "parsing" || state === "executing"}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {state === "parsing" ? "解析中..." : "解析開始"}
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && state !== "preview" && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Step 2: Preview */}
      {(state === "preview" || state === "executing") && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Step 2: プレビュー</h2>

            <div className="mb-4 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span className="text-gray-700">{previewData.length}件のレコードを検出</span>
              </div>
              {warnings.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠</span>
                  <span className="text-yellow-700">{warnings.length}件の警告</span>
                </div>
              )}
              {errors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">✗</span>
                  <span className="text-red-700">{errors.length}件のエラー</span>
                </div>
              )}
            </div>

            {/* Validation Results */}
            <ValidationErrors errors={errors} warnings={warnings} />

            {/* Conflict Error */}
            {errorMessage && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Preview Table */}
          {previewData.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-gray-900">データプレビュー</h3>
              <PreviewTable data={previewData} dataType={dataType} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleReset}
              className="rounded-lg bg-gray-600 px-6 py-3 font-medium text-white hover:bg-gray-700"
            >
              キャンセル
            </button>
            <button
              onClick={handleExecute}
              disabled={errors.length > 0 || state === "executing"}
              className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {state === "executing" ? "インポート中..." : "インポート実行"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
