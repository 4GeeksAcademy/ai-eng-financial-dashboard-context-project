import { describe, expect, it } from "vitest";

import { toQueryString } from "./api";

describe("toQueryString", () => {
  it("returns an empty string when no bounds are set", () => {
    expect(toQueryString({})).toBe("");
  });

  it("omits undefined keys", () => {
    expect(toQueryString({ start_date: "2026-01-01", end_date: undefined })).toBe(
      "?start_date=2026-01-01",
    );
  });

  it("serializes both bounds", () => {
    expect(
      toQueryString({ start_date: "2026-01-01", end_date: "2026-03-31" }),
    ).toBe("?start_date=2026-01-01&end_date=2026-03-31");
  });

  it("serializes the alert threshold with the date range", () => {
    expect(toQueryString({ threshold: 0.3, start_date: "2026-01-01" })).toBe(
      "?threshold=0.3&start_date=2026-01-01",
    );
  });

  it("does not add group_by because the API defaults alerts to month", () => {
    expect(toQueryString({ threshold: 0.3 })).toBe("?threshold=0.3");
  });
});
