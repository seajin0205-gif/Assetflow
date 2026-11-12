import { expect, test } from "@playwright/test";

test("a market fill uses the live quote and updates the ledger", async ({
  page,
}) => {
  await page.goto("/trade");
  const buyingPower = page.getByTestId("buying-power");
  await expect(buyingPower).toContainText("₩");
  const before = (await buyingPower.textContent()) ?? "";

  await page.getByRole("button", { name: "시장가" }).click();
  await page.getByLabel("수량").fill("1");
  await page.getByRole("button", { name: "매수 주문하기" }).click();

  await expect(page.getByText("NVDA 매수 1주 접수")).toBeVisible();
  await expect(buyingPower).not.toHaveText(before);

  await page.getByRole("button", { name: "내역" }).click();
  await expect(page.getByText("체결").first()).toBeVisible();
  await expect(page.getByText("1주").first()).toBeVisible();
  await expect(page.getByText("13주").first()).toBeVisible();
});
