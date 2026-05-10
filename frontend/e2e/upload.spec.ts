import { expect, test } from "@playwright/test";

const mockReport = {
  dataset: {
    row_count: 2,
    column_count: 3,
    columns: [
      { name: "date", dtype: "object", missing_count: 0 },
      { name: "sales", dtype: "int64", missing_count: 0 },
      { name: "profit", dtype: "int64", missing_count: 0 },
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
    category_summaries: [],
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

test.describe("Upload page", () => {
  // アップロードページの主要テキストが表示されることを確認する
  test("should render upload page content", async ({ page }) => {
    await page.goto("/upload");

    await expect(
      page.getByRole("heading", { name: "CSVをアップロード" }),
    ).toBeVisible();

    await expect(
      page.getByText("分析したいCSVファイルを選択してください。"),
    ).toBeVisible();

    await expect(
      page.getByText("CSVファイルをドラッグ＆ドロップ"),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "アップロードして分析" }),
    ).toBeDisabled();
  });

  // CSVファイルを選択するとファイル名が表示され、ボタンが有効になることを確認する
  test("should show selected csv file name and enable submit button", async ({
    page,
  }) => {
    await page.goto("/upload");

    await page.getByLabel("ファイルを選択").setInputFiles({
      name: "sales.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("date,sales,profit\n2026-01-01,1000,200"),
    });

    await expect(page.getByText("選択中: sales.csv")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "アップロードして分析" }),
    ).toBeEnabled();
  });

  // CSVアップロード成功時にレポートページへ遷移することを確認する
  test("should upload csv and navigate to report page", async ({ page }) => {
    await page.route("**/api/v1/reports/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockReport),
      });
    });

    await page.goto("/upload");

    await page.getByLabel("ファイルを選択").setInputFiles({
      name: "sales.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("date,sales,profit\n2026-01-01,1000,200"),
    });

    await page.getByRole("button", { name: "アップロードして分析" }).click();

    await expect(page).toHaveURL(/\/report$/);

    await expect(
      page.getByRole("heading", { name: "分析レポート" }),
    ).toBeVisible();

    await expect(page.getByText("売上は増加傾向です。")).toBeVisible();
  });

  // APIが失敗した場合にalertが表示されることを確認する
  test("should show alert when upload api returns error", async ({ page }) => {
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe("分析に失敗しました。");
      await dialog.accept();
    });

    await page.route("**/api/v1/reports/analyze", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "分析に失敗しました。",
        }),
      });
    });

    await page.goto("/upload");

    await page.getByLabel("ファイルを選択").setInputFiles({
      name: "sales.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("date,sales,profit\n2026-01-01,1000,200"),
    });

    await page.getByRole("button", { name: "アップロードして分析" }).click();

    await expect(page).toHaveURL(/\/upload$/);
  });
});
