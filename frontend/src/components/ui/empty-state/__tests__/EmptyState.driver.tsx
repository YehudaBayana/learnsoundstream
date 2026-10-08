import { fireEvent, render, RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EmptyState, { EmptyStateType } from "../EmptyState";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface EmptyStateDriverProps {
  dataHook?: string;
  type?: EmptyStateType;
  customTitle?: string;
  customMessage?: string;
  actionText?: string;
  onAction?: () => void;
}

export class EmptyStateDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-empty-state";

  render(props: EmptyStateDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <MemoryRouter>
        <EmptyState {...props} type={props.type ?? "generic"} dataHook={dataHook} />
      </MemoryRouter>,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("EmptyStateDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  getTitle(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-title`).textContent?.trim() ?? "";
  }

  getMessage(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-message`).textContent?.trim() ?? "";
  }

  clickAction(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-action`));
  }
}
