import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  // トップページの主要テキストとCTAが表示されることを確認する
  test("should render home page content", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Insight Report AI" }),
    ).toBeVisible();

    await expect(
      page.getByText("CSVから、すぐに読める分析レポートへ"),
    ).toBeVisible();

    await expect(
      page.getByText(
        "CSVをアップロードするだけで、データ概要、統計情報、グラフ、AI要約をまとめて確認できます。",
      ),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "CSVをアップロード" }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "できることを見る" }),
    ).toBeVisible();
  });

  // ヘッダーのCSV分析リンクからアップロードページへ遷移できることを確認する
  test("should navigate to upload page from header link", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "CSVを分析" }).click();

    await expect(page).toHaveURL(/\/upload$/);
    await expect(
      page.getByRole("heading", { name: "CSVをアップロード" }),
    ).toBeVisible();
  });

  // できることセクションが表示されることを確認する
  test("should render features section", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "できることを見る" }).click();

    await expect(
      page.getByRole("heading", { name: "アップロード" }),
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "可視化" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "AI要約" })).toBeVisible();
  });
});
