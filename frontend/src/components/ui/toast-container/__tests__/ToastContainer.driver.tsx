import { act, fireEvent, render, RenderResult } from "@testing-library/react";
import ToastContainer from "../ToastContainer";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export class ToastContainerDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "toast-container";

  render(dataHook = this.defaultDataHook): this {
    this.renderResult = render(<ToastContainer dataHook={dataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("ToastContainerDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  hasToast(id: string, dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-item-${id}`) !== null;
  }

  clickDismiss(id: string, dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-toast-${id}-dismiss`));
  }

  advanceDismissAnimation(): void {
    act(() => jest.advanceTimersByTime(200));
  }
}
