// @vitest-environment happy-dom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriceFlash } from "./price-flash";

describe("PriceFlash", () => {
  it("flashes green after a rise and red after a fall", () => {
    const view = render(<PriceFlash value={100}>$100.00</PriceFlash>);

    expect(
      view.container.querySelector("[data-flash]")?.getAttribute("data-flash"),
    ).toBe("flat");

    view.rerender(<PriceFlash value={100.2}>$100.20</PriceFlash>);
    expect(view.container.querySelector("[data-flash]")?.className).toContain(
      "price-flash-up",
    );

    view.rerender(<PriceFlash value={99.8}>$99.80</PriceFlash>);
    expect(view.container.querySelector("[data-flash]")?.className).toContain(
      "price-flash-down",
    );
  });
});
