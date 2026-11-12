import { expect, test } from "@playwright/test";

test("dashboard quotes tick and the connection pill shows latency", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const status = page.getByTestId("connection-status");
  await expect(status).toContainText("WS Connected");
  await expect(status).toContainText(/\d+ms/);

  const background = await page.waitForFunction(
    () => {
      const element = document.querySelector(
        "[data-testid='quote-NVDA'] [data-flash]",
      );
      const flash = element?.getAttribute("data-flash");
      if (flash !== "up" && flash !== "down") return null;
      return getComputedStyle(element as Element).backgroundColor;
    },
    null,
    { timeout: 15000, polling: 50 },
  );
  expect(await background.jsonValue()).not.toMatch(
    /rgba\(0,\s*0,\s*0,\s*0\)|^transparent$/,
  );
});

test("trade ticket flashes the live price and chart", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trade");

  await expect(page.getByTestId("connection-status")).toContainText(
    "WS Connected",
  );
  await page.waitForFunction(
    () => {
      const flash = document
        .querySelector("header [data-flash]")
        ?.getAttribute("data-flash");
      return flash === "up" || flash === "down";
    },
    null,
    { timeout: 15000, polling: 50 },
  );

  await page.getByRole("button", { name: "차트" }).click();
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
  await expect(page.locator("[data-chart-flash]")).toHaveCount(0);
});

test("mobile dashboard keeps the connection pill beside search", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByTestId("connection-status")).toContainText(
    "WS Connected",
  );
  await expect(page.getByTestId("quote-AAPL")).toBeVisible();
});
