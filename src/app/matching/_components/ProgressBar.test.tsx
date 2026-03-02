import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("進捗率0-49%の時、赤色のプログレスバーを表示する", () => {
    render(<ProgressBar totalCadCount={100} linkedCount={30} progressPercent={30} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "30");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");

    // 赤色（#F44336）のスタイルが適用されていることを確認
    const progressFill = screen.getByTestId("progress-fill");
    expect(progressFill).toHaveClass("bg-[#F44336]");

    // テキスト表示を確認
    expect(screen.getByText("紐付け進捗 30% (30/100)")).toBeInTheDocument();
  });

  it("進捗率50-89%の時、黄色のプログレスバーを表示する", () => {
    render(<ProgressBar totalCadCount={100} linkedCount={70} progressPercent={70} />);

    const progressFill = screen.getByTestId("progress-fill");
    expect(progressFill).toHaveClass("bg-[#FFC107]");
    expect(screen.getByText("紐付け進捗 70% (70/100)")).toBeInTheDocument();
  });

  it("進捗率90-100%の時、緑色のプログレスバーを表示する", () => {
    render(<ProgressBar totalCadCount={100} linkedCount={95} progressPercent={95} />);

    const progressFill = screen.getByTestId("progress-fill");
    expect(progressFill).toHaveClass("bg-[#4CAF50]");
    expect(screen.getByText("紐付け進捗 95% (95/100)")).toBeInTheDocument();
  });

  it("CADデータ総件数が0の場合、0%を表示する", () => {
    render(<ProgressBar totalCadCount={0} linkedCount={0} progressPercent={0} />);

    expect(screen.getByText("紐付け進捗 0% (0/0)")).toBeInTheDocument();
    const progressFill = screen.getByTestId("progress-fill");
    expect(progressFill).toHaveClass("bg-[#F44336]");
  });

  it("100%完了時、緑色のプログレスバーを表示する", () => {
    render(<ProgressBar totalCadCount={100} linkedCount={100} progressPercent={100} />);

    const progressFill = screen.getByTestId("progress-fill");
    expect(progressFill).toHaveClass("bg-[#4CAF50]");
    expect(screen.getByText("紐付け進捗 100% (100/100)")).toBeInTheDocument();
  });
});
