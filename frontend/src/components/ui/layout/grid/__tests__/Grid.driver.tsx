import React from "react";
import { render, RenderResult } from "@testing-library/react";
import Grid, { GridCols, GridGap } from "../Grid";
import { getByDataHook } from "@/__tests__/testUtils";

export interface GridDriverProps {
  dataHook?: string;
  cols?: GridCols;
  colsMobile?: GridCols;
  gap?: GridGap;
}

export class GridDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-grid";

  render(props: GridDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Grid {...props} dataHook={dataHook}>
        <span>Cell</span>
      </Grid>,
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult)
      throw new Error("GridDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, dataHook);
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }
}
