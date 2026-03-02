import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { FooterActions } from "./FooterActions";

describe("FooterActions", () => {
  const defaultProps = {
    hasUnsavedChanges: false,
    onSave: vi.fn(),
    onDiscard: vi.fn(),
    onExit: vi.fn(),
    onExport: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("4つのボタンが正しい順序で表示される", () => {
    render(<FooterActions {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);

    // 左から: Excel出力、破棄、保存、紐付け終了
    expect(buttons[0]).toHaveTextContent("Excel出力");
    expect(buttons[1]).toHaveTextContent("破棄");
    expect(buttons[2]).toHaveTextContent("保存");
    expect(buttons[3]).toHaveTextContent("紐付け終了");
  });

  it("保存ボタンを押下すると onSave が呼ばれる", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<FooterActions {...defaultProps} onSave={onSave} />);

    const saveButton = screen.getByRole("button", { name: "保存" });
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledOnce();
  });

  it("破棄ボタンを押下すると確認ダイアログが表示され、「はい」選択時に onDiscard が呼ばれる", async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();

    // window.confirm をモック
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<FooterActions {...defaultProps} onDiscard={onDiscard} />);

    const discardButton = screen.getByRole("button", { name: "破棄" });
    await user.click(discardButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      "未保存の変更をすべて破棄しますか?この操作は取り消せません。",
    );
    expect(onDiscard).toHaveBeenCalledOnce();

    confirmSpy.mockRestore();
  });

  it("破棄ボタンを押下して「いいえ」を選択すると onDiscard が呼ばれない", async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();

    // window.confirm をモック（false を返す）
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<FooterActions {...defaultProps} onDiscard={onDiscard} />);

    const discardButton = screen.getByRole("button", { name: "破棄" });
    await user.click(discardButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDiscard).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it("未保存がある状態で紐付け終了ボタンを押下すると未保存警告ダイアログが表示される", async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();

    // window.confirm をモック
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<FooterActions {...defaultProps} hasUnsavedChanges={true} onExit={onExit} />);

    const exitButton = screen.getByRole("button", { name: "紐付け終了" });
    await user.click(exitButton);

    expect(confirmSpy).toHaveBeenCalledWith("未保存のデータがあります。保存せずに終了しますか?");
    expect(onExit).toHaveBeenCalledOnce();

    confirmSpy.mockRestore();
  });

  it("未保存がない状態で紐付け終了ボタンを押下すると確認ダイアログが表示される", async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();

    // window.confirm をモック
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<FooterActions {...defaultProps} hasUnsavedChanges={false} onExit={onExit} />);

    const exitButton = screen.getByRole("button", { name: "紐付け終了" });
    await user.click(exitButton);

    expect(confirmSpy).toHaveBeenCalledWith("紐付け作業を終了します。よろしいですか?");
    expect(onExit).toHaveBeenCalledOnce();

    confirmSpy.mockRestore();
  });

  it("Excel出力ボタンを押下すると onExport が呼ばれる", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();

    render(<FooterActions {...defaultProps} onExport={onExport} />);

    const exportButton = screen.getByRole("button", { name: "Excel出力" });
    await user.click(exportButton);

    expect(onExport).toHaveBeenCalledOnce();
  });

  it("ボタンがレイアウトガイドライン通りに配置される", () => {
    const { container } = render(<FooterActions {...defaultProps} />);

    // フッター全体がフレックスレイアウト
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveClass("flex");

    // Excel出力が左端、他が右寄り
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("Excel出力"); // 左端
    expect(buttons[3]).toHaveTextContent("紐付け終了"); // 最右端
  });
});
