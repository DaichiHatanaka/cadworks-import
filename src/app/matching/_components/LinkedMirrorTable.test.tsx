import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { LinkedMirrorTable } from "./LinkedMirrorTable";
import type { LinkedPair } from "@/lib/matching/types";

const mockCadRecord = {
  id: "cad-1",
  jobNo: "JOB001",
  listType: "PUMP",
  kid: "KID001",
  idCount: "00001",
  kikiNo: "P-001",
  kikiBame: "給水ポンプ",
  qtyOrd: "2",
  shortSpec: "150A 5.5kW",
  cwxLinkedFlg: null,
};

const mockTbomRecord = {
  id: "tbom-1",
  jobNo: "JOB001",
  listType: "PUMP",
  kid: "KID001",
  idCount: "00001",
  kikiNo: "P-001-MOD",
  kikiBame: "給水ポンプ改造",
  qtyOrd: "2",
  shortSpec: "150A 7.5kW",
};

describe("LinkedMirrorTable", () => {
  it("ステータス列 + CAD 側5属性 + T-BOM 側5属性を左右対称で表示する", () => {
    const pairs: LinkedPair[] = [
      {
        id: "pair-1",
        cad: mockCadRecord,
        tbom: mockTbomRecord,
        status: "unsaved",
      },
    ];

    render(
      <LinkedMirrorTable
        pairs={pairs}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        statusFilter="all"
        searchText=""
      />,
    );

    // ヘッダーの確認
    expect(screen.getByText("ステータス")).toBeInTheDocument();
    expect(screen.getByText("CAD - リストタイプ")).toBeInTheDocument();
    expect(screen.getByText("T-BOM - リストタイプ")).toBeInTheDocument();

    // CAD側データの確認
    expect(screen.getByText("P-001")).toBeInTheDocument();
    expect(screen.getByText("給水ポンプ")).toBeInTheDocument();

    // T-BOM側データの確認
    expect(screen.getByText("P-001-MOD")).toBeInTheDocument();
    expect(screen.getByText("給水ポンプ改造")).toBeInTheDocument();
  });

  it("同一属性の値が異なるセルをオレンジ色でハイライト表示する", () => {
    const pairs: LinkedPair[] = [
      {
        id: "pair-1",
        cad: mockCadRecord,
        tbom: mockTbomRecord,
        status: "unsaved",
      },
    ];

    const { container } = render(
      <LinkedMirrorTable
        pairs={pairs}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        statusFilter="all"
        searchText=""
      />,
    );

    // 機器番号の差異セル（P-001 vs P-001-MOD）
    const kikiNoCells = container.querySelectorAll('[data-diff="true"]');
    expect(kikiNoCells.length).toBeGreaterThan(0);
  });

  it("T-BOM対応なし（追加）の行はT-BOM側全セルをグレー背景で表示する", () => {
    const pairs: LinkedPair[] = [
      {
        id: "pair-1",
        cad: mockCadRecord,
        tbom: null,
        status: "unsaved",
      },
    ];

    const { container } = render(
      <LinkedMirrorTable
        pairs={pairs}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        statusFilter="all"
        searchText=""
      />,
    );

    const grayedCells = container.querySelectorAll('[data-tbom-absent="true"]');
    expect(grayedCells.length).toBeGreaterThan(0);
  });

  it("未保存ステータスを黄色バッジ、保存済みを緑バッジで表示する", () => {
    const pairs: LinkedPair[] = [
      {
        id: "pair-1",
        cad: mockCadRecord,
        tbom: mockTbomRecord,
        status: "unsaved",
      },
      {
        id: "pair-2",
        cad: { ...mockCadRecord, id: "cad-2" },
        tbom: { ...mockTbomRecord, id: "tbom-2" },
        status: "saved",
      },
    ];

    render(
      <LinkedMirrorTable
        pairs={pairs}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        statusFilter="all"
        searchText=""
      />,
    );

    expect(screen.getByText("未保存")).toBeInTheDocument();
    expect(screen.getByText("保存済み")).toBeInTheDocument();
  });

  it("LIST_TYPE → KID の昇順でソートする", () => {
    const pairs: LinkedPair[] = [
      {
        id: "pair-2",
        cad: { ...mockCadRecord, listType: "VALVE", kid: "KID002" },
        tbom: { ...mockTbomRecord, listType: "VALVE", kid: "KID002" },
        status: "unsaved",
      },
      {
        id: "pair-1",
        cad: { ...mockCadRecord, listType: "PUMP", kid: "KID001" },
        tbom: { ...mockTbomRecord, listType: "PUMP", kid: "KID001" },
        status: "unsaved",
      },
    ];

    render(
      <LinkedMirrorTable
        pairs={pairs}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        statusFilter="all"
        searchText=""
      />,
    );

    const rows = screen.getAllByRole("row");
    // ヘッダー行を除く最初のデータ行が PUMP, 2番目が VALVE の順であることを確認
    expect(rows[1]).toHaveTextContent("PUMP");
    expect(rows[2]).toHaveTextContent("VALVE");
  });

  it("リストタイプフィルタで絞り込みを行う", () => {
    const pairs: LinkedPair[] = [
      {
        id: "pair-1",
        cad: { ...mockCadRecord, listType: "PUMP" },
        tbom: { ...mockTbomRecord, listType: "PUMP" },
        status: "unsaved",
      },
      {
        id: "pair-2",
        cad: { ...mockCadRecord, id: "cad-2", listType: "VALVE" },
        tbom: { ...mockTbomRecord, id: "tbom-2", listType: "VALVE" },
        status: "unsaved",
      },
    ];

    render(
      <LinkedMirrorTable
        pairs={pairs}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter="PUMP"
        statusFilter="all"
        searchText=""
      />,
    );

    // PUMP のみ表示
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2); // ヘッダー + 1データ行
  });

  it("ステータスフィルタで絞り込みを行う", () => {
    const pairs: LinkedPair[] = [
      {
        id: "pair-1",
        cad: mockCadRecord,
        tbom: mockTbomRecord,
        status: "unsaved",
      },
      {
        id: "pair-2",
        cad: { ...mockCadRecord, id: "cad-2" },
        tbom: { ...mockTbomRecord, id: "tbom-2" },
        status: "saved",
      },
    ];

    render(
      <LinkedMirrorTable
        pairs={pairs}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        statusFilter="unsaved"
        searchText=""
      />,
    );

    // 未保存のみ表示
    expect(screen.getByText("未保存")).toBeInTheDocument();
    expect(screen.queryByText("保存済み")).not.toBeInTheDocument();
  });

  it("テキスト検索で機器番号と機器名称を対象にインクリメンタルサーチを行う", async () => {
    const user = userEvent.setup();
    const pairs: LinkedPair[] = [
      {
        id: "pair-1",
        cad: { ...mockCadRecord, kikiNo: "P-001" },
        tbom: { ...mockTbomRecord, kikiNo: "P-001" },
        status: "unsaved",
      },
      {
        id: "pair-2",
        cad: { ...mockCadRecord, id: "cad-2", kikiNo: "V-001" },
        tbom: { ...mockTbomRecord, id: "tbom-2", kikiNo: "V-001" },
        status: "unsaved",
      },
    ];

    render(
      <LinkedMirrorTable
        pairs={pairs}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        statusFilter="all"
        searchText="P-001"
      />,
    );

    // P-001 のみ表示
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2); // ヘッダー + 1データ行
    expect(screen.getAllByText("P-001")).toHaveLength(2); // CAD側 + T-BOM側
    expect(screen.queryByText("V-001")).not.toBeInTheDocument();
  });

  it("行選択時にコールバックを呼び出す", async () => {
    const user = userEvent.setup();
    const onSelectRow = vi.fn();
    const pairs: LinkedPair[] = [
      {
        id: "pair-1",
        cad: mockCadRecord,
        tbom: mockTbomRecord,
        status: "unsaved",
      },
    ];

    render(
      <LinkedMirrorTable
        pairs={pairs}
        selectedRow={null}
        onSelectRow={onSelectRow}
        listTypeFilter={null}
        statusFilter="all"
        searchText=""
      />,
    );

    const row = screen.getAllByRole("row")[1];
    await user.click(row);

    expect(onSelectRow).toHaveBeenCalledWith(pairs[0]);
  });
});
