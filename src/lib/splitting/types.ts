export type SplitStatus = "auto" | "manual" | "done";

export interface SplitCandidate {
  id: string;
  listType: string;
  kikiNo: string;
  kikiBame: string;
  qtyOrd: string;
  shortSpec: string | null;
  canAutoSplit: boolean;
  parsedKikiNos: string[] | null;
}

export interface SplitCandidatesResponse {
  candidates: SplitCandidate[];
  stats: {
    total: number;
    autoCount: number;
    manualCount: number;
  };
}

export interface SplitExecuteRequest {
  jobNo: string;
  items: Array<{
    id: string;
    kikiNos: string[];
  }>;
}

export interface SplitExecuteResponse {
  success: boolean;
  splitCount: number;
}
