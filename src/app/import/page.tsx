/**
 * CSV Import Page
 */
import { ImportForm } from "./_components/ImportForm";

export default function ImportPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">データインポート</h1>
          <p className="text-gray-600">
            CADデータまたはT-BOMデータをCSVファイルからインポートします
          </p>
        </div>

        <ImportForm />
      </div>
    </div>
  );
}
