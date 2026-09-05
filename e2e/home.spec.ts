import { test, expect } from "@playwright/test";

test("unauthenticated visitors to the app entry point are redirected to sign in", async ({
  page,
}) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login\?next=%2Fapp/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
