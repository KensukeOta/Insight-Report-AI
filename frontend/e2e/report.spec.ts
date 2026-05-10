import { expect, test } from "@playwright/test";

const mockReport = {
  dataset: {
    row_count: 2,
    column_count: 3,
    columns: [
      { name: "date", dtype: "object", missing_count: 0 },
      { name: "sales", dtype: "int64", missing_count: 0 },
      { name: "profit", dtype: "int64", missing_count: 1 },
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
      {
        column_x: "sales",
        column_y: "profit",
        correlation: 0.875,
      },
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
      id: "chart-1",
      title: "売上ヒストグラム",
      type: "histogram",
      image_base64:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    },
  ],
  ai_report: {
    summary: "売上は増加傾向です。",
    highlights: ["売上が伸びています。", "利益も安定しています。"],
    insights: ["売上と利益には関連があります。"],
    recommendations: ["欠損値の確認を続けてください。"],
    cautions: ["データ件数が少ないため解釈に注意してください。"],
  },
};

test.describe("Report page", () => {
  // sessionStorageにレポートがない場合にデータなしメッセージが表示されることを確認する
  test("should show empty message when report data does not exist", async ({
    page,
  }) => {
    await page.goto("/report");

    await expect(page.getByText("データがありません")).toBeVisible();

    await expect(
      page.getByText("CSVをアップロードしてからレポートを確認してください。"),
    ).toBeVisible();
  });

  // sessionStorageにレポートがある場合に分析レポートが表示されることを確認する
  test("should render report page from session storage", async ({ page }) => {
    await page.goto("/");

    await page.evaluate((report) => {
      sessionStorage.setItem("report", JSON.stringify(report));
    }, mockReport);

    await page.goto("/report");

    await expect(
      page.getByRole("heading", { name: "分析レポート" }),
    ).toBeVisible();

    await expect(page.getByText("行数")).toBeVisible();
    await expect(page.getByText("列数")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "グラフ分析" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "カラム情報" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "CSVプレビュー" }),
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "統計情報" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "相関係数" })).toBeVisible();
    
    await expect(page.getByText("売上は増加傾向です。")).toBeVisible();
    await expect(page.getByText("売上が伸びています。")).toBeVisible();
    await expect(
      page.getByText("欠損値の確認を続けてください。"),
    ).toBeVisible();
  });

  // Markdownダウンロードボタンが表示されることを確認する
  test("should show markdown download button", async ({ page }) => {
    await page.goto("/");

    await page.evaluate((report) => {
      sessionStorage.setItem("report", JSON.stringify(report));
    }, mockReport);

    await page.goto("/report");

    await expect(
      page.getByRole("button", { name: "Markdownでダウンロード" }),
    ).toBeVisible();
  });

  // PDF保存ボタンが表示されることを確認する
  test("should show pdf save button", async ({ page }) => {
    await page.goto("/");

    await page.evaluate((report) => {
      sessionStorage.setItem("report", JSON.stringify(report));
    }, mockReport);

    await page.goto("/report");

    await expect(
      page.getByRole("button", { name: "PDFとして保存" }),
    ).toBeVisible();
  });
});
