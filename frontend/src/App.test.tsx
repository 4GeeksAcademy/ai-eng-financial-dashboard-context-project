import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("renders the period derived from the metrics response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            create_date: "2024-01-10",
            amount: 1000,
            operation_type: "income",
            category: "sales",
            business_type: "B2B",
          },
          {
            create_date: "2024-02-01",
            amount: 250,
            operation_type: "outcome",
            category: "suppliers",
            business_type: "B2C",
          },
        ],
      }),
    );

    render(<App />);

    expect(
      await screen.findByText("Jan 10, 2024 - Feb 1, 2024"),
    ).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith("/api/metrics");
  });
});
