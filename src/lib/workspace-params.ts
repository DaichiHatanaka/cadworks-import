const STORAGE_KEY = "cadworks_workspace_params";

export interface WorkspaceParams {
  jobNo: string;
  caseNo?: string;
  constructionType?: string;
  listTypes?: string;
}

export function saveWorkspaceParams(params: WorkspaceParams): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
}

export function loadWorkspaceParams(): WorkspaceParams | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.jobNo === "string" && parsed.jobNo.trim()) {
      return parsed as WorkspaceParams;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearWorkspaceParams(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
