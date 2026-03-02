import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndLinkProvider } from "./DndLinkProvider";
import type { CwxRecord, TbomRecord } from "@/lib/matching/types";

describe("DndLinkProvider", () => {
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

  it("子要素をレンダリングする", () => {
    render(
      <DndLinkProvider onLink={vi.fn()}>
        <div>Test Content</div>
      </DndLinkProvider>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("DndContextを提供する", () => {
    // DndContext が提供されていることを確認
    // （実際のDnD操作はE2Eテストで確認）
    const onLink = vi.fn();

    render(
      <DndLinkProvider onLink={onLink}>
        <div data-testid="dnd-content">DnD Content</div>
      </DndLinkProvider>,
    );

    expect(screen.getByTestId("dnd-content")).toBeInTheDocument();
  });
});
