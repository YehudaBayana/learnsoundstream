import { act, fireEvent, render, RenderResult } from "@testing-library/react";
import ServerStatus from "../ServerStatus";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export class ServerStatusDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "server-status";

  render(dataHook = this.defaultDataHook): this {
    this.renderResult = render(<ServerStatus dataHook={dataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("ServerStatusDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  getConnectionStatus(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-connection`).textContent?.trim() ?? "";
  }

  isPanelOpen(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-panel`) !== null;
  }

  togglePanel(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-toggle`));
  }

  async flushHealthCheck(): Promise<void> {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
}
