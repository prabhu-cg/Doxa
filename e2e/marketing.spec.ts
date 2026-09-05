import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  { path: "/", heading: "Turn community input into better decisions." },
  { path: "/features", heading: "What Doxa does, and what it's built to do" },
  { path: "/pricing", heading: "Start free. Upgrade when you need more." },
  { path: "/why-doxa", heading: "Feedback is not the same as a decision" },
  { path: "/about", heading: "Why Doxa exists" },
  { path: "/contact", heading: "Get in touch" },
  { path: "/privacy", heading: "Privacy Policy" },
  { path: "/terms", heading: "Terms of Service" },
  { path: "/security", heading: "Security" },
];

test.describe("marketing pages render", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.path} renders with its main heading`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBeLessThan(400);
      await expect(
        page.getByRole("heading", {
          name: route.heading,
          level: route.path === "/" ? 1 : undefined,
        }),
      ).toBeVisible();
    });
  }
});

test.describe("navigation", () => {
  test("header nav links go to the right pages", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Features" })
      .click();
    await expect(page).toHaveURL(/\/features$/);

    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Pricing" })
      .click();
    await expect(page).toHaveURL(/\/pricing$/);

    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Why Doxa" })
      .click();
    await expect(page).toHaveURL(/\/why-doxa$/);

    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "About" })
      .click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test("footer links are present and resolve", async ({ page, request }) => {
    await page.goto("/");
    const footerLinks = page.locator("footer a[href^='/']");
    const hrefs = await footerLinks.evaluateAll((els) =>
      els
        .map((el) => el.getAttribute("href"))
        .filter((href): href is string => !!href),
    );
    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), `${href} should not be broken`).toBeLessThan(
        400,
      );
    }
  });

  test("mobile navigation menu opens and navigates", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation", { name: "Mobile" })
      .getByRole("link", { name: "Pricing" })
      .click();
    await expect(page).toHaveURL(/\/pricing$/);
  });
});

test.describe("primary marketing journey", () => {
  test("Home → Features → Pricing → Start Free → Signup", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Features" })
      .click();
    await expect(page).toHaveURL(/\/features$/);

    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Pricing" })
      .click();
    await expect(page).toHaveURL(/\/pricing$/);

    await page.getByRole("link", { name: "Start Free" }).first().click();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(
      page.getByRole("heading", { name: "Create your account" }),
    ).toBeVisible();
  });
});

test.describe("contact form", () => {
  test("shows validation errors for empty required fields", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText("Enter your name")).toBeVisible();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText(/at least 10 characters/)).toBeVisible();
  });

  test("submits successfully with valid input", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Name").fill("Jane Doe");
    await page.getByLabel("Email").fill("jane@example.com");
    await page
      .getByLabel("Message")
      .fill("Just checking out Doxa, looks great so far.");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText("Message sent")).toBeVisible();
  });
});

test.describe("SEO", () => {
  test("homepage has the expected title and meta description", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(
      "Doxa — Turn community input into better decisions",
    );
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      "Doxa helps organisations collect feedback, understand what matters, prioritise with confidence, and communicate better decisions.",
    );
  });

  test("sitemap.xml exists and lists public routes", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/pricing");
    expect(body).toContain("/features");
  });

  test("robots.txt exists and references the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Sitemap:");
    expect(body).toContain("Disallow: /app");
  });
});
