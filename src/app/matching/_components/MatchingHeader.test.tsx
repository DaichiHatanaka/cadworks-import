import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchingHeader } from "./MatchingHeader";

describe("MatchingHeader", () => {
  it("画面タイトル、工番、ケース、施工区分を表示する", () => {
    render(
      <MatchingHeader
        screenTitle="CADWorx 手動紐付け画面"
        jobNo="202401001"
        caseNo="Case-01"
        constructionType="新設"
        totalCadCount={100}
        linkedCount={50}
        progressPercent={50}
      />,
    );

    expect(screen.getByText("CADWorx 手動紐付け画面")).toBeInTheDocument();
    expect(screen.getByText(/工番:/)).toBeInTheDocument();
    expect(screen.getByText("202401001")).toBeInTheDocument();
    expect(screen.getByText(/ケース:/)).toBeInTheDocument();
    expect(screen.getByText("Case-01")).toBeInTheDocument();
    expect(screen.getByText(/施工区分:/)).toBeInTheDocument();
    expect(screen.getByText("新設")).toBeInTheDocument();
  });

  it("プログレスバーを表示する", () => {
    render(
      <MatchingHeader
        screenTitle="CADWorx 手動紐付け画面"
        jobNo="202401001"
        caseNo="Case-01"
        constructionType="新設"
        totalCadCount={100}
        linkedCount={75}
        progressPercent={75}
      />,
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("紐付け進捗 75% (75/100)")).toBeInTheDocument();
  });

  it("動的な画面タイトルを表示する", () => {
    render(
      <MatchingHeader
        screenTitle="P&ID 紐付け画面"
        jobNo="202401002"
        caseNo="Case-02"
        constructionType="増設"
        totalCadCount={50}
        linkedCount={10}
        progressPercent={20}
      />,
    );

    expect(screen.getByText("P&ID 紐付け画面")).toBeInTheDocument();
  });
});
