import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CadUnlinkedTable } from "./CadUnlinkedTable";
import type { CwxRecord } from "@/lib/matching/types";

const mockCadRecords: CwxRecord[] = [
  {
    id: "cad-1",
    jobNo: "202401001",
    listType: "PUMP",
    kid: "P-001",
    idCount: "00001",
    kikiNo: "PMP-001",
    kikiBame: "給水ポンプ",
    qtyOrd: "2",
    shortSpec: "50Hz 5.5kW",
    cwxLinkedFlg: null,
  },
  {
    id: "cad-2",
    jobNo: "202401001",
    listType: "VALVE",
    kid: "V-001",
    idCount: "00002",
    kikiNo: "VLV-001",
    kikiBame: "バタフライ弁",
    qtyOrd: "1",
    shortSpec: "DN100",
    cwxLinkedFlg: null,
  },
  {
    id: "cad-3",
    jobNo: "202401001",
    listType: "PUMP",
    kid: "P-002",
    idCount: "00003",
    kikiNo: "PMP-002",
    kikiBame: "排水ポンプ",
    qtyOrd: "1",
    shortSpec: "60Hz 7.5kW",
    cwxLinkedFlg: null,
  },
];

describe("CadUnlinkedTable", () => {
  it("CADデータの5属性を表示する", () => {
    const mockOnSelectRow = vi.fn();
    const mockOnDoubleClick = vi.fn();

    render(
      <CadUnlinkedTable
        data={mockCadRecords}
        selectedRow={null}
        onSelectRow={mockOnSelectRow}
        onDoubleClick={mockOnDoubleClick}
        listTypeFilter={null}
        availableListTypes={["PUMP", "VALVE"]}
        onListTypeFilterChange={vi.fn()}
      />,
    );

    // ヘッダー列を確認
    expect(screen.getByText("リストタイプ")).toBeInTheDocument();
    expect(screen.getByText("機器番号")).toBeInTheDocument();
    expect(screen.getByText("機器名称")).toBeInTheDocument();
    expect(screen.getByText("数量")).toBeInTheDocument();
    expect(screen.getByText("概略仕様")).toBeInTheDocument();

    // データ行を確認（セレクトボックスの中にもPUMPがあるので、getAllByTextを使う）
    expect(screen.getAllByText("PUMP").length).toBeGreaterThan(0);
    expect(screen.getByText("PMP-001")).toBeInTheDocument();
    expect(screen.getByText("給水ポンプ")).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getByText("50Hz 5.5kW")).toBeInTheDocument();
  });

  it("残件数をヘッダーに表示する", () => {
    const mockOnSelectRow = vi.fn();
    const mockOnDoubleClick = vi.fn();

    render(
      <CadUnlinkedTable
        data={mockCadRecords}
        selectedRow={null}
        onSelectRow={mockOnSelectRow}
        onDoubleClick={mockOnDoubleClick}
        listTypeFilter={null}
        availableListTypes={["PUMP", "VALVE"]}
        onListTypeFilterChange={vi.fn()}
      />,
    );

    expect(screen.getByText("CAD（未紐付け）残 3件")).toBeInTheDocument();
  });

  it("テーブルヘッダーを青背景で表示する", () => {
    const mockOnSelectRow = vi.fn();
    const mockOnDoubleClick = vi.fn();

    render(
      <CadUnlinkedTable
        data={mockCadRecords}
        selectedRow={null}
        onSelectRow={mockOnSelectRow}
        onDoubleClick={mockOnDoubleClick}
        listTypeFilter={null}
        availableListTypes={["PUMP", "VALVE"]}
        onListTypeFilterChange={vi.fn()}
      />,
    );

    const header = screen.getByRole("row", { name: /リストタイプ/ }).parentElement;
    expect(header).toHaveClass("bg-[#1976D2]");
  });

  it("行クリックで選択ハンドラーを呼び出す", async () => {
    const user = userEvent.setup();
    const mockOnSelectRow = vi.fn();
    const mockOnDoubleClick = vi.fn();

    render(
      <CadUnlinkedTable
        data={mockCadRecords}
        selectedRow={null}
        onSelectRow={mockOnSelectRow}
        onDoubleClick={mockOnDoubleClick}
        listTypeFilter={null}
        availableListTypes={["PUMP", "VALVE"]}
        onListTypeFilterChange={vi.fn()}
      />,
    );

    const firstRow = screen.getByText("PMP-001").closest("tr");
    if (firstRow) {
      await user.click(firstRow);
      expect(mockOnSelectRow).toHaveBeenCalledWith(mockCadRecords[0]);
    }
  });

  it("行ダブルクリックで追加ハンドラーを呼び出す", async () => {
    const user = userEvent.setup();
    const mockOnSelectRow = vi.fn();
    const mockOnDoubleClick = vi.fn();

    render(
      <CadUnlinkedTable
        data={mockCadRecords}
        selectedRow={null}
        onSelectRow={mockOnSelectRow}
        onDoubleClick={mockOnDoubleClick}
        listTypeFilter={null}
        availableListTypes={["PUMP", "VALVE"]}
        onListTypeFilterChange={vi.fn()}
      />,
    );

    const firstRow = screen.getByText("PMP-001").closest("tr");
    if (firstRow) {
      await user.dblClick(firstRow);
      expect(mockOnDoubleClick).toHaveBeenCalledWith(mockCadRecords[0]);
    }
  });

  it("リストタイプフィルタを適用する", () => {
    const mockOnSelectRow = vi.fn();
    const mockOnDoubleClick = vi.fn();

    render(
      <CadUnlinkedTable
        data={mockCadRecords}
        selectedRow={null}
        onSelectRow={mockOnSelectRow}
        onDoubleClick={mockOnDoubleClick}
        listTypeFilter="PUMP"
        availableListTypes={["PUMP", "VALVE"]}
        onListTypeFilterChange={vi.fn()}
      />,
    );

    // PUMP のみ表示される（テーブル行内のPUMPのみカウント、セレクトボックスのオプションは除外）
    const pumpCells = screen.getAllByRole("cell", { name: "PUMP" });
    expect(pumpCells).toHaveLength(2);
    // VALVEはテーブル行には表示されない（セレクトボックスにはある）
    const valveCells = screen.queryAllByRole("cell", { name: "VALVE" });
    expect(valveCells).toHaveLength(0);
  });
});
