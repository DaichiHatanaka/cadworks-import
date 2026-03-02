import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinkActions } from "./LinkActions";
import type { CwxRecord, TbomRecord, LinkedPair } from "@/lib/matching/types";

describe("LinkActions", () => {
  const mockCadRow: CwxRecord = {
    id: "cad-1",
    jobNo: "J001",
    listType: "P",
    kid: "K001",
    idCount: "00001",
    kikiNo: "PUMP-001",
    kikiBame: "ポンプA",
    qtyOrd: "2",
    shortSpec: "100L/min",
    cwxLinkedFlg: null,
  };

  const mockTbomRow: TbomRecord = {
    id: "tbom-1",
    jobNo: "J001",
    listType: "P",
    kid: "K001",
    idCount: "00001",
    kikiNo: "PUMP-001",
    kikiBame: "ポンプA",
    qtyOrd: "2",
    shortSpec: "100L/min",
  };

  const mockTbomRowDifferentType: TbomRecord = {
    ...mockTbomRow,
    id: "tbom-2",
    listType: "V",
  };

  const mockLinkedPair: LinkedPair = {
    id: "link-1",
    cad: mockCadRow,
    tbom: mockTbomRow,
    status: "unsaved",
  };

  it("CAD行とT-BOM行が選択されていない場合、紐付けボタンと追加ボタンを無効化する", () => {
    render(
      <LinkActions
        selectedCadRow={null}
        selectedTbomRow={null}
        selectedLinkedRow={null}
        onLink={vi.fn()}
        onAdd={vi.fn()}
        onUnlink={vi.fn()}
      />,
    );

    const linkButton = screen.getByRole("button", { name: "紐付け" });
    const addButton = screen.getByRole("button", { name: "追加" });

    expect(linkButton).toBeDisabled();
    expect(addButton).toBeDisabled();
  });

  it("CAD行のみ選択されている場合、追加ボタンを有効化する", () => {
    render(
      <LinkActions
        selectedCadRow={mockCadRow}
        selectedTbomRow={null}
        selectedLinkedRow={null}
        onLink={vi.fn()}
        onAdd={vi.fn()}
        onUnlink={vi.fn()}
      />,
    );

    const linkButton = screen.getByRole("button", { name: "紐付け" });
    const addButton = screen.getByRole("button", { name: "追加" });

    expect(linkButton).toBeDisabled();
    expect(addButton).toBeEnabled();
  });

  it("CAD行とT-BOM行が両方選択されている場合、紐付けボタンと追加ボタンを有効化する", () => {
    render(
      <LinkActions
        selectedCadRow={mockCadRow}
        selectedTbomRow={mockTbomRow}
        selectedLinkedRow={null}
        onLink={vi.fn()}
        onAdd={vi.fn()}
        onUnlink={vi.fn()}
      />,
    );

    const linkButton = screen.getByRole("button", { name: "紐付け" });
    const addButton = screen.getByRole("button", { name: "追加" });

    expect(linkButton).toBeEnabled();
    expect(addButton).toBeEnabled();
  });

  it("下段の行が未選択の場合、紐付け解除ボタンを無効化する", () => {
    render(
      <LinkActions
        selectedCadRow={null}
        selectedTbomRow={null}
        selectedLinkedRow={null}
        onLink={vi.fn()}
        onAdd={vi.fn()}
        onUnlink={vi.fn()}
      />,
    );

    const unlinkButton = screen.getByRole("button", { name: "紐付け解除" });
    expect(unlinkButton).toBeDisabled();
  });

  it("下段の行が選択されている場合、紐付け解除ボタンを有効化する", () => {
    render(
      <LinkActions
        selectedCadRow={null}
        selectedTbomRow={null}
        selectedLinkedRow={mockLinkedPair}
        onLink={vi.fn()}
        onAdd={vi.fn()}
        onUnlink={vi.fn()}
      />,
    );

    const unlinkButton = screen.getByRole("button", { name: "紐付け解除" });
    expect(unlinkButton).toBeEnabled();
  });

  it("紐付けボタン押下時に onLink を呼び出す（LIST_TYPE一致時）", async () => {
    const user = userEvent.setup();
    const onLink = vi.fn().mockReturnValue({ success: true });

    render(
      <LinkActions
        selectedCadRow={mockCadRow}
        selectedTbomRow={mockTbomRow}
        selectedLinkedRow={null}
        onLink={onLink}
        onAdd={vi.fn()}
        onUnlink={vi.fn()}
      />,
    );

    const linkButton = screen.getByRole("button", { name: "紐付け" });
    await user.click(linkButton);

    expect(onLink).toHaveBeenCalledWith(mockCadRow, mockTbomRow);
  });

  it("紐付けボタン押下時にLIST_TYPE不一致の場合、警告ダイアログを表示する", async () => {
    const user = userEvent.setup();
    const onLink = vi.fn().mockReturnValue({
      success: false,
      reason: "list_type_mismatch",
    });

    // window.alert をモック
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <LinkActions
        selectedCadRow={mockCadRow}
        selectedTbomRow={mockTbomRowDifferentType}
        selectedLinkedRow={null}
        onLink={onLink}
        onAdd={vi.fn()}
        onUnlink={vi.fn()}
      />,
    );

    const linkButton = screen.getByRole("button", { name: "紐付け" });
    await user.click(linkButton);

    expect(onLink).toHaveBeenCalledWith(mockCadRow, mockTbomRowDifferentType);
    expect(alertSpy).toHaveBeenCalledWith(
      "リストタイプが一致しません。同一リストタイプの機器のみ紐付けできます。",
    );

    alertSpy.mockRestore();
  });

  it("追加ボタン押下時に onAdd を呼び出す", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <LinkActions
        selectedCadRow={mockCadRow}
        selectedTbomRow={null}
        selectedLinkedRow={null}
        onLink={vi.fn()}
        onAdd={onAdd}
        onUnlink={vi.fn()}
      />,
    );

    const addButton = screen.getByRole("button", { name: "追加" });
    await user.click(addButton);

    expect(onAdd).toHaveBeenCalledWith(mockCadRow);
  });

  it("紐付け解除ボタン押下時に onUnlink を呼び出す", async () => {
    const user = userEvent.setup();
    const onUnlink = vi.fn();

    render(
      <LinkActions
        selectedCadRow={null}
        selectedTbomRow={null}
        selectedLinkedRow={mockLinkedPair}
        onLink={vi.fn()}
        onAdd={vi.fn()}
        onUnlink={onUnlink}
      />,
    );

    const unlinkButton = screen.getByRole("button", { name: "紐付け解除" });
    await user.click(unlinkButton);

    expect(onUnlink).toHaveBeenCalledWith(mockLinkedPair);
  });
});
