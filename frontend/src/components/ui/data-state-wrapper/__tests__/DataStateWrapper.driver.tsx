import React from "react";
import { fireEvent, render, RenderResult } from "@testing-library/react";
import DataStateWrapper from "../DataStateWrapper";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface DataStateWrapperDriverProps {
  dataHook?: string;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyBehavior?: "show-empty" | "hide";
  onRetry?: () => void;
}

export class DataStateWrapperDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-data-state";

  render(props: DataStateWrapperDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <DataStateWrapper
        {...props}
        loading={props.loading ?? false}
        dataHook={dataHook}
      >
        <span data-hook={`${dataHook}-content`}>Content</span>
      </DataStateWrapper>,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error(
        "DataStateWrapperDriver: render() must be called before querying",
      );
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  hasState(
    suffix: "loading" | "error" | "empty" | "content",
    dataHook = this.defaultDataHook,
  ): boolean {
    return (
      queryByDataHook(this.getContainer(), `${dataHook}-${suffix}`) !== null
    );
  }

  clickRetry(dataHook = this.defaultDataHook): void {
    fireEvent.click(
      getByDataHook(this.getContainer(), `${dataHook}-retry`)
        .parentElement as HTMLElement,
    );
  }
}
