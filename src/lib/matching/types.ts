/** CADWorx 側レコード */
export interface CwxRecord {
  id: string;
  jobNo: string;
  listType: string;
  kid: string;
  idCount: string;
  kikiNo: string;
  kikiBame: string;
  qtyOrd: string;
  shortSpec: string | null;
  cwxLinkedFlg: string | null;
}

/** T-BOM（原価管理）側レコード */
export interface TbomRecord {
  id: string;
  jobNo: string;
  listType: string;
  kid: string;
  idCount: string;
  kikiNo: string;
  kikiBame: string;
  qtyOrd: string;
  shortSpec: string | null;
}

/** 紐付け済みペア */
export interface LinkedPair {
  id: string;
  cad: CwxRecord;
  tbom: TbomRecord | null;
  status: "saved" | "unsaved";
}

/** 自動紐付け結果 */
export interface AutoLinkResult {
  linkedPairs: LinkedPair[];
  unlinkedCad: CwxRecord[];
  unlinkedTbom: TbomRecord[];
}
