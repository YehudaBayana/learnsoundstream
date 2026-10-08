import React from "react";
import { render, RenderResult, fireEvent } from "@testing-library/react";
import HistoryView from "../views/HistoryView";
import { queryByDataHook, getByDataHook } from "@/__tests__/testUtils";

export class HistoryViewDriver {
  private renderResult: RenderResult | null = null;

  render(dataHook = "history-view-container"): this {
    this.renderResult = render(<HistoryView dataHook={dataHook} />);
    return this;
  }

  exists(dataHook = "history-view-container"): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, dataHook) !== null;
  }

  getHeadingText(): string {
    if (!this.renderResult) throw new Error("HistoryViewDriver: render() required");
    const heading = getByDataHook(this.renderResult.container, "history-view-heading");
    return heading.textContent?.trim() ?? "";
  }

  isLoadingVisible(): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, "history-loading-text") !== null;
  }

  isErrorVisible(): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, "history-error-container") !== null;
  }

  getErrorText(): string {
    if (!this.renderResult) throw new Error("HistoryViewDriver: render() required");
    const errorText = getByDataHook(this.renderResult.container, "history-error-text");
    return errorText.textContent?.trim() ?? "";
  }

  isEmptyStateVisible(): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, "history-empty-text") !== null;
  }

  clickRetry(): void {
    if (!this.renderResult) throw new Error("HistoryViewDriver: render() required");
    const retryBtn = getByDataHook(this.renderResult.container, "history-retry-button");
    fireEvent.click(retryBtn);
  }
}
