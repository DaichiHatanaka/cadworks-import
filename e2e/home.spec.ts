import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and displays the Next.js logo", async ({ page }) => {
    await page.goto("/");
    const logo = page.getByRole("img", { name: "Next.js logo" });
    await expect(logo).toBeVisible();
  });

  test("has a link to Vercel deployment", async ({ page }) => {
    await page.goto("/");
    const deployLink = page.getByRole("link", { name: /deploy now/i });
    await expect(deployLink).toBeVisible();
    await expect(deployLink).toHaveAttribute("href", /vercel\.com/);
  });

  test("page title is set", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Create Next App/i);
  });
});
