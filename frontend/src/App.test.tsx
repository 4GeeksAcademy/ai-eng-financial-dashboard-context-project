/** @vitest-environment jsdom */

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MonthlyDataPoint } from "@/lib/financial-types";
import App from "./App";

vi.mock("@/components/dashboard/income-outcome-chart", () => ({
  IncomeOutcomeChart: ({ data }: { data: MonthlyDataPoint[] }) => (
    <div role="img" aria-label="Income outcome chart">
      {data.map((point) => point.month).join(", ")}
    </div>
  ),
}));

vi.mock("@/components/dashboard/profit-percent-chart", () => ({
  ProfitPercentChart: ({ data }: { data: MonthlyDataPoint[] }) => (
    <div role="img" aria-label="Profit margin chart">
      {data.map((point) => `${point.month}: ${point.profitPercent}%`).join(", ")}
    </div>
  ),
}));

const sampleSummary = [
  { period: "2024-01", income: 1000, outcome: 250, net: 750 },
  { period: "2024-02", income: 500, outcome: 0, net: 500 },
];

function makeResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("App financial summary loading", () => {
  it("renders loading state and then KPI and chart data from the API", async () => {
    let resolveResponse: (response: Response) => void = () => {};
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const fetchMock = vi.fn<
      (url: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >(() => pendingResponse);
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    expect(
      screen.getByRole("region", { name: "Key performance indicators" })
        .getAttribute("aria-busy"),
    ).toBe("true");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/metrics/summary?group_by=month",
    );

    await act(async () => {
      resolveResponse(makeResponse(sampleSummary));
    });

    expect(await screen.findByText("$1,500")).toBeTruthy();
    expect(screen.getByText("$250")).toBeTruthy();
    expect(screen.getByText("$1,250")).toBeTruthy();
    expect(screen.getByText("83.3%")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Income outcome chart" }).textContent)
      .toBe("Jan 2024, Feb 2024");
    expect(
      screen.getByRole("region", { name: "Key performance indicators" })
        .getAttribute("aria-busy"),
    ).toBe("false");
  });

  it("shows the HTTP status when the API responds with an error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse({}, 503)));

    render(<App />);

    expect((await screen.findByRole("alert")).textContent).toContain("HTTP 503");
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it("shows network errors to the user", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("network unavailable")),
    );

    render(<App />);

    expect((await screen.findByRole("alert")).textContent)
      .toContain("network unavailable");
  });

  it("aborts the pending request when unmounted without reporting an error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { unmount } = render(<App />);
    const requestOptions = fetchMock.mock.calls[0][1];
    unmount();

    expect(requestOptions?.signal?.aborted).toBe(true);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(consoleError).not.toHaveBeenCalled();
  });
});