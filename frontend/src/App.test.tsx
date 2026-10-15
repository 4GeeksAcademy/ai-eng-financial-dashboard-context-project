import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FinancialDataError } from "./App";

describe("FinancialDataError", () => {
  it("announces the English error message to assistive technology", () => {
    const markup = renderToStaticMarkup(
      <FinancialDataError message="Unable to load financial data. Please check the backend API." />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain(
      "Unable to load financial data. Please check the backend API.",
    );
  });
});