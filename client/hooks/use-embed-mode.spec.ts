import { describe, expect, it } from "vitest";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useEmbedMode } from "./use-embed-mode";

function Probe() {
  const embedded = useEmbedMode();
  const [params] = useSearchParams();
  return createElement("span", {
    "data-embed": embedded ? "1" : "0",
    "data-raw": params.get("embed") ?? "",
  });
}

describe("useEmbedMode", () => {
  it("is true when embed=1", () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, { initialEntries: ["/?embed=1"] }, createElement(Probe)),
    );
    expect(html).toContain('data-embed="1"');
  });

  it("is false without the query", () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, { initialEntries: ["/"] }, createElement(Probe)),
    );
    expect(html).toContain('data-embed="0"');
  });
});
