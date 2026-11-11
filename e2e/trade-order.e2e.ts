import { expect, test, type Page, type Route } from "@playwright/test";

test.describe("trade order placement", () => {
  test("places a limit order and shows the acceptance toast", async ({
    page,
  }) => {
    let submitted: Record<string, unknown> | null = null;
    await page.route("**/api/orders", async (route) => {
      submitted = route.request().postDataJSON() as Record<string, unknown>;
      const key = route.request().headers()["idempotency-key"];
      expect(key).toMatch(/^[A-Za-z0-9_.:-]{8,200}$/);
      await fulfillOrder(route, 201, {
        id: "ord-e2e-1",
        accountId: "demo",
        symbol: "NVDA",
        side: "buy",
        type: "limit",
        quantity: 4,
        limitPrice: "890.00",
        status: "open",
        filledQuantity: 0,
        averagePrice: null,
        reservedCash: "3560.00",
      });
    });

    await openTradeTicket(page);
    await page.getByLabel("주문 가격").fill("890.00");
    await page.getByLabel("수량").fill("4");
    await page.getByRole("button", { name: "매수 주문하기" }).click();

    await expect(page.getByText("NVDA 매수 4주 접수")).toBeVisible();
    expect(submitted).toMatchObject({
      symbol: "NVDA",
      side: "buy",
      type: "limit",
      quantity: 4,
      limitPrice: 890,
    });
  });

  test("shows the server error when buying power is not enough", async ({
    page,
  }) => {
    await page.route("**/api/orders", async (route) => {
      await fulfillOrder(route, 422, {
        type: "https://assetflow.dev/problems/insufficient-funds",
        title: "Insufficient Funds",
        status: 422,
        detail: "Buying power cannot cover the order.",
        instance: "/api/orders",
      });
    });

    await openTradeTicket(page);
    await page.getByLabel("주문 가격").fill("892.40");
    await page.getByLabel("수량").fill("1000");
    await page.getByRole("button", { name: "매수 주문하기" }).click();

    await expect(page.getByText("주문가능 금액을 초과했습니다.")).toBeVisible();
    await expect(page.getByText("NVDA 매수 1000주 접수")).toHaveCount(0);
  });
});

async function openTradeTicket(page: Page) {
  await page.goto("/trade");
  await expect(
    page.getByRole("button", { name: "매수 주문하기" }),
  ).toBeVisible();
}

async function fulfillOrder(route: Route, status: number, body: unknown) {
  const contentType =
    status >= 400 ? "application/problem+json" : "application/json";
  await route.fulfill({
    status,
    contentType,
    body: JSON.stringify(body),
  });
}
