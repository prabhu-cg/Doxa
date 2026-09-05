import { test, expect } from "@playwright/test";

test("home page renders the Doxa placeholder", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Doxa" })).toBeVisible();
});
