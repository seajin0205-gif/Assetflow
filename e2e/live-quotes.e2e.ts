import { expect, test } from "@playwright/test";

test("dashboard quotes tick and the connection pill shows latency", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const status = page.getByTestId("connection-status");
  await expect(status).toContainText("WS Connected");
  await expect(status).toContainText(/\d+ms/);

  const quote = page.getByTestId("quote-NVDA");
  const before = await quote.innerText();
  await expect(quote).not.toHaveText(before, { timeout: 4000 });
  const flash = quote.locator("[data-flash]");
  await expect(flash).toHaveAttribute("data-flash", /up|down/);
  const background = await flash.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(background).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|^transparent$/);
});

test("trade ticket flashes the live price and chart", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trade");

  await expect(page.getByTestId("connection-status")).toContainText(
    "WS Connected",
  );
  const price = page.locator("header [data-flash]").first();
  const before = await price.innerText();
  await expect(price).not.toHaveText(before, { timeout: 4000 });
  await expect(price).toHaveAttribute("data-flash", /up|down/);

  await page.getByRole("button", { name: "차트" }).click();
  const frame = page.locator("[data-chart-flash]");
  await expect(frame).toHaveAttribute("data-chart-flash", /up|down/, {
    timeout: 4000,
  });
  const shadow = await frame.evaluate(
    (element) => getComputedStyle(element).boxShadow,
  );
  expect(shadow).not.toBe("none");
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
