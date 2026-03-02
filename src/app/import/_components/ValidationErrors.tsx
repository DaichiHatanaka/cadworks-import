/**
 * Validation errors and warnings display component
 */
import type { ValidationError, ValidationWarning } from "@/lib/csv/types";

interface ValidationErrorsProps {
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export function ValidationErrors({ errors, warnings }: ValidationErrorsProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">✗</span>
            <h3 className="font-semibold text-red-900">{errors.length}件のエラー</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <ul className="space-y-1 text-sm text-red-800">
              {errors.map((error, index) => (
                <li key={index}>
                  行{error.row}: {error.field && `[${error.field}] `}
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">⚠</span>
            <h3 className="font-semibold text-yellow-900">{warnings.length}件の警告</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <ul className="space-y-1 text-sm text-yellow-800">
              {warnings.map((warning, index) => (
                <li key={index}>
                  行{warning.row}: {warning.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
