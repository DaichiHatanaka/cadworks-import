import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TbomUnlinkedTable } from "./TbomUnlinkedTable";
import type { TbomRecord } from "@/lib/matching/types";

describe("TbomUnlinkedTable", () => {
  const mockData: TbomRecord[] = [
    {
      id: "tbom-1",
      jobNo: "J001",
      listType: "P",
      kid: "K001",
      idCount: "00001",
      kikiNo: "PUMP-001",
      kikiBame: "ポンプA",
      qtyOrd: "2",
      shortSpec: "100L/min",
    },
    {
      id: "tbom-2",
      jobNo: "J001",
      listType: "V",
      kid: "K002",
      idCount: "00002",
      kikiNo: "VALVE-001",
      kikiBame: "バルブB",
      qtyOrd: "5",
      shortSpec: null,
    },
    {
      id: "tbom-3",
      jobNo: "J001",
      listType: "P",
      kid: "K003",
      idCount: "00003",
      kikiNo: "PUMP-002",
      kikiBame: "ポンプC",
      qtyOrd: "1",
      shortSpec: "200L/min",
    },
  ];

  it("5属性（LIST_TYPE, KIKI_NO, KIKI_BAME, QTY_ORD, SHORT_SPEC）を表示する", () => {
    const onSelectRow = vi.fn();

    render(
      <TbomUnlinkedTable
        data={mockData}
        selectedRow={null}
        onSelectRow={onSelectRow}
        listTypeFilter={null}
        availableListTypes={["P", "V"]}
        onListTypeFilterChange={vi.fn()}
        isLinkedFilterEnabled={true}
      />,
    );

    // ヘッダー確認
    expect(screen.getByText("リストタイプ")).toBeInTheDocument();
    expect(screen.getByText("機器番号")).toBeInTheDocument();
    expect(screen.getByText("機器名称")).toBeInTheDocument();
    expect(screen.getByText("数量")).toBeInTheDocument();
    expect(screen.getByText("概略仕様")).toBeInTheDocument();

    // データ確認
    expect(screen.getByText("PUMP-001")).toBeInTheDocument();
    expect(screen.getByText("ポンプA")).toBeInTheDocument();
    expect(screen.getByText("100L/min")).toBeInTheDocument();
  });

  it("残件数をリアルタイム表示する", () => {
    render(
      <TbomUnlinkedTable
        data={mockData}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        availableListTypes={["P", "V"]}
        onListTypeFilterChange={vi.fn()}
        isLinkedFilterEnabled={true}
      />,
    );

    expect(screen.getByText("T-BOM（未紐付け）残 3件")).toBeInTheDocument();
  });

  it("LIST_TYPE → KID の昇順でソートする", () => {
    render(
      <TbomUnlinkedTable
        data={mockData}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        availableListTypes={["P", "V"]}
        onListTypeFilterChange={vi.fn()}
        isLinkedFilterEnabled={true}
      />,
    );

    const rows = screen.getAllByRole("row");
    // ヘッダー行を除く
    const dataRows = rows.slice(1);

    // LIST_TYPE: P, P, V の順序（KIDでソート: K001, K003, K002）
    expect(dataRows[0]).toHaveTextContent("PUMP-001");
    expect(dataRows[1]).toHaveTextContent("PUMP-002");
    expect(dataRows[2]).toHaveTextContent("VALVE-001");
  });

  it("行選択機能が動作する", async () => {
    const user = userEvent.setup();
    const onSelectRow = vi.fn();

    render(
      <TbomUnlinkedTable
        data={mockData}
        selectedRow={null}
        onSelectRow={onSelectRow}
        listTypeFilter={null}
        availableListTypes={["P", "V"]}
        onListTypeFilterChange={vi.fn()}
        isLinkedFilterEnabled={true}
      />,
    );

    const firstRow = screen.getByText("PUMP-001").closest("tr");
    expect(firstRow).toBeInTheDocument();

    await user.click(firstRow!);
    expect(onSelectRow).toHaveBeenCalledWith(mockData[0]);
  });

  it("選択行がハイライト表示される", () => {
    render(
      <TbomUnlinkedTable
        data={mockData}
        selectedRow={mockData[0]}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        availableListTypes={["P", "V"]}
        onListTypeFilterChange={vi.fn()}
        isLinkedFilterEnabled={true}
      />,
    );

    const selectedRow = screen.getByText("PUMP-001").closest("tr");
    expect(selectedRow).toHaveClass("bg-blue-50");
  });

  it("リストタイプフィルタが動作する", () => {
    const onListTypeFilterChange = vi.fn();

    render(
      <TbomUnlinkedTable
        data={mockData}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter="P"
        availableListTypes={["P", "V"]}
        onListTypeFilterChange={onListTypeFilterChange}
        isLinkedFilterEnabled={true}
      />,
    );

    // フィルタ適用後は P タイプのみ表示
    expect(screen.getByText("T-BOM（未紐付け）残 2件")).toBeInTheDocument();
    expect(screen.getByText("PUMP-001")).toBeInTheDocument();
    expect(screen.getByText("PUMP-002")).toBeInTheDocument();
    expect(screen.queryByText("VALVE-001")).not.toBeInTheDocument();
  });

  it("連動フィルタ無効時はフィルタが適用されない", () => {
    render(
      <TbomUnlinkedTable
        data={mockData}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter="P"
        availableListTypes={["P", "V"]}
        onListTypeFilterChange={vi.fn()}
        isLinkedFilterEnabled={false}
      />,
    );

    // 連動フィルタOFFなので全データ表示
    expect(screen.getByText("T-BOM（未紐付け）残 3件")).toBeInTheDocument();
    expect(screen.getByText("PUMP-001")).toBeInTheDocument();
    expect(screen.getByText("VALVE-001")).toBeInTheDocument();
  });

  it("テーブルヘッダーが青背景・白文字で表示される", () => {
    render(
      <TbomUnlinkedTable
        data={mockData}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        availableListTypes={["P", "V"]}
        onListTypeFilterChange={vi.fn()}
        isLinkedFilterEnabled={true}
      />,
    );

    const thead = screen.getByText("リストタイプ").closest("thead");
    expect(thead).toHaveClass("bg-[#1976D2]");
    expect(thead).toHaveClass("text-white");
  });

  it("データが空の場合、メッセージを表示する", () => {
    render(
      <TbomUnlinkedTable
        data={[]}
        selectedRow={null}
        onSelectRow={vi.fn()}
        listTypeFilter={null}
        availableListTypes={[]}
        onListTypeFilterChange={vi.fn()}
        isLinkedFilterEnabled={true}
      />,
    );

    expect(screen.getByText("未紐付けのT-BOMデータがありません")).toBeInTheDocument();
  });
});
