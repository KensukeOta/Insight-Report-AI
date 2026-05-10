import type { ReportData } from "./ReportView";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReportView } from "./ReportView";

const mockData: ReportData = {
  dataset: {
    row_count: 1200,
    column_count: 4,
    columns: [
      { name: "date", dtype: "object", missing_count: 0 },
      { name: "sales", dtype: "int64", missing_count: 1 },
      { name: "profit", dtype: "float64", missing_count: 2 },
    ],
    preview: [
      { date: "2026-01-01", sales: "1000", profit: "200" },
      { date: "2026-01-02", sales: "1500", profit: "300" },
    ],
  },
  statistics: {
    numeric_summary: [
      { column: "sales", mean: 1250 },
      { column: "profit", mean: 250 },
    ],
    correlations: [
      { column_x: "sales", column_y: "profit", correlation: 0.87654 },
      { column_x: "sales", column_y: "cost", correlation: null },
    ],
    category_summaries: [
      {
        category_column: "region",
        numeric_column: "sales",
        aggregation: "sum",
        items: [
          { label: "Tokyo", value: 3000 },
          { label: "Osaka", value: null },
        ],
      },
    ],
  },
  charts: [
    {
      id: "hist-sales",
      title: "sales histogram",
      type: "histogram",
      image_base64: "dummy-histogram",
    },
    {
      id: "line-sales",
      title: "sales line chart",
      type: "line",
      image_base64: "dummy-line",
    },
    {
      id: "scatter-sales-profit",
      title: "sales profit scatter",
      type: "scatter",
      image_base64: "dummy-scatter",
    },
    {
      id: "bar-region-sales",
      title: "region sales bar",
      type: "bar",
      image_base64: "dummy-bar",
    },
  ],
  ai_report: {
    summary: "売上と利益は全体的に増加傾向です。",
    highlights: [
      "売上は安定しています。",
      "利益率に改善余地があります。",
      "一部データに欠損があります。",
    ],
    insights: ["売上と利益には強い相関があります。"],
    recommendations: ["欠損値の補完を検討してください。"],
    cautions: ["データ件数が少ない場合は解釈に注意してください。"],
  },
};

describe("ReportView", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    });

    vi.spyOn(document, "createElement");
    vi.spyOn(window, "print").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // レポートのタイトルと説明文が表示されることを確認する
  it("should render report header", () => {
    render(<ReportView data={mockData} />);

    expect(
      screen.getByRole("heading", { name: "分析レポート" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "CSVから抽出した概要、統計、可視化、AI要約をまとめて表示しています。",
      ),
    ).toBeInTheDocument();
  });

  // データ概要のカードが表示されることを確認する
  it("should render dataset summary cards", () => {
    render(<ReportView data={mockData} />);

    expect(screen.getByText("行数")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();

    expect(screen.getByText("列数")).toBeInTheDocument();
    expect(screen.getAllByText("4")).toHaveLength(2);

    expect(screen.getByText("グラフ")).toBeInTheDocument();
    expect(screen.getAllByText("4")).toHaveLength(2);
  });

  // 重要ポイントが表示されることを確認する
  it("should render highlights", () => {
    render(<ReportView data={mockData} />);

    expect(screen.getByText("重要ポイント")).toBeInTheDocument();
    expect(screen.getByText("売上は安定しています。")).toBeInTheDocument();
    expect(
      screen.getByText("利益率に改善余地があります。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("一部データに欠損があります。"),
    ).toBeInTheDocument();
  });

  // カラム情報のテーブルが表示されることを確認する
  it("should render column information table", () => {
    render(<ReportView data={mockData} />);

    expect(
      screen.getByRole("heading", { name: "カラム情報" }),
    ).toBeInTheDocument();

    expect(screen.getAllByText("date")).toHaveLength(2);
    expect(screen.getByText("object")).toBeInTheDocument();

    expect(screen.getAllByText("sales")).toHaveLength(3);
    expect(screen.getByText("int64")).toBeInTheDocument();

    expect(screen.getAllByText("profit")).toHaveLength(3);
    expect(screen.getByText("float64")).toBeInTheDocument();
  });

  // CSVプレビューが表示されることを確認する
  it("should render csv preview table", () => {
    render(<ReportView data={mockData} />);

    expect(
      screen.getByRole("heading", { name: "CSVプレビュー" }),
    ).toBeInTheDocument();

    expect(screen.getByText("2026-01-01")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();

    expect(screen.getByText("2026-01-02")).toBeInTheDocument();
    expect(screen.getByText("1500")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
  });

  // プレビューが空の場合に空メッセージが表示されることを確認する
  it("should render empty preview message when preview is empty", () => {
    render(
      <ReportView
        data={{
          ...mockData,
          dataset: {
            ...mockData.dataset,
            preview: [],
          },
        }}
      />,
    );

    expect(
      screen.getByText("プレビューできるデータがありません。"),
    ).toBeInTheDocument();
  });

  // 統計情報が表示されることを確認する
  it("should render numeric summaries", () => {
    render(<ReportView data={mockData} />);

    expect(
      screen.getByRole("heading", { name: "統計情報" }),
    ).toBeInTheDocument();

    expect(screen.getAllByText("sales")).toHaveLength(3);
    expect(screen.getByText("1,250")).toBeInTheDocument();

    expect(screen.getAllByText("profit")).toHaveLength(3);
    expect(screen.getByText("250")).toBeInTheDocument();
  });

  // 相関係数が小数3桁とN/Aで表示されることを確認する
  it("should render correlations", () => {
    render(<ReportView data={mockData} />);

    expect(
      screen.getByRole("heading", { name: "相関係数" }),
    ).toBeInTheDocument();

    expect(screen.getByText("sales × profit")).toBeInTheDocument();
    expect(screen.getByText("0.877")).toBeInTheDocument();

    expect(screen.getByText("sales × cost")).toBeInTheDocument();
    expect(screen.getAllByText("N/A")).toHaveLength(2);
  });

  // 相関係数が空の場合に空メッセージが表示されることを確認する
  it("should render empty correlations message when correlations are empty", () => {
    render(
      <ReportView
        data={{
          ...mockData,
          statistics: {
            ...mockData.statistics,
            correlations: [],
          },
        }}
      />,
    );

    expect(
      screen.getByText(
        "相関係数を算出できる数値カラムの組み合わせがありません。",
      ),
    ).toBeInTheDocument();
  });

  // カテゴリ別集計が表示されることを確認する
  it("should render category summaries", () => {
    render(<ReportView data={mockData} />);

    expect(
      screen.getByRole("heading", { name: "カテゴリ別集計" }),
    ).toBeInTheDocument();

    expect(screen.getByText("region 別 sales 合計")).toBeInTheDocument();
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
    expect(screen.getByText("3,000")).toBeInTheDocument();
    expect(screen.getByText("Osaka")).toBeInTheDocument();
    expect(screen.getAllByText("N/A")).toHaveLength(2);
  });

  // カテゴリ別集計が空の場合に空メッセージが表示されることを確認する
  it("should render empty category summaries message when category summaries are empty", () => {
    render(
      <ReportView
        data={{
          ...mockData,
          statistics: {
            ...mockData.statistics,
            category_summaries: [],
          },
        }}
      />,
    );

    expect(
      screen.getByText("カテゴリ別集計に適した列がありません。"),
    ).toBeInTheDocument();
  });

  // グラフ画像が種類ごとに表示されることを確認する
  it("should render chart groups and images", () => {
    render(<ReportView data={mockData} />);

    expect(screen.getByText("📊 分布分析")).toBeInTheDocument();
    expect(screen.getByText("📈 時系列分析")).toBeInTheDocument();
    expect(screen.getByText("🔗 相関分析")).toBeInTheDocument();
    expect(screen.getByText("🏷 カテゴリ分析")).toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: "sales histogram" }),
    ).toHaveAttribute("src", "data:image/png;base64,dummy-histogram");

    expect(
      screen.getByRole("img", { name: "sales line chart" }),
    ).toHaveAttribute("src", "data:image/png;base64,dummy-line");

    expect(
      screen.getByRole("img", { name: "sales profit scatter" }),
    ).toHaveAttribute("src", "data:image/png;base64,dummy-scatter");

    expect(
      screen.getByRole("img", { name: "region sales bar" }),
    ).toHaveAttribute("src", "data:image/png;base64,dummy-bar");
  });

  // AI要約の概要・気づき・改善提案・注意点が表示されることを確認する
  it("should render ai report sections", () => {
    render(<ReportView data={mockData} />);

    expect(screen.getByRole("heading", { name: "AI要約" })).toBeInTheDocument();
    expect(
      screen.getByText("売上と利益は全体的に増加傾向です。"),
    ).toBeInTheDocument();

    expect(screen.getByText("気づき")).toBeInTheDocument();
    expect(
      screen.getByText("売上と利益には強い相関があります。"),
    ).toBeInTheDocument();

    expect(screen.getByText("改善提案")).toBeInTheDocument();
    expect(
      screen.getByText("欠損値の補完を検討してください。"),
    ).toBeInTheDocument();

    expect(screen.getByText("注意点")).toBeInTheDocument();
    expect(
      screen.getByText("データ件数が少ない場合は解釈に注意してください。"),
    ).toBeInTheDocument();
  });

  // MarkdownダウンロードボタンをクリックするとBlob URLが作成されることを確認する
  it("should create markdown download when markdown button is clicked", async () => {
    const user = userEvent.setup();
    const clickMock = vi.fn();

    const createElementSpy = vi.spyOn(document, "createElement");

    createElementSpy.mockImplementation((tagName) => {
      const element = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        tagName,
      );

      if (tagName === "a") {
        element.click = clickMock;
      }

      return element;
    });

    render(<ReportView data={mockData} />);

    await user.click(
      screen.getByRole("button", { name: "Markdownでダウンロード" }),
    );

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickMock).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  // PDF保存ボタンをクリックするとwindow.printが呼ばれることを確認する
  it("should call window print when pdf button is clicked", async () => {
    const user = userEvent.setup();

    render(<ReportView data={mockData} />);

    await user.click(screen.getByRole("button", { name: "PDFとして保存" }));

    expect(window.print).toHaveBeenCalled();
  });
});
