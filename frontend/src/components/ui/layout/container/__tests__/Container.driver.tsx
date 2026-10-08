import React from "react";
import { render, RenderResult } from "@testing-library/react";
import Container, { ContainerSize } from "../Container";
import { getByDataHook } from "@/__tests__/testUtils";

export interface ContainerDriverProps {
  dataHook?: string;
  size?: ContainerSize;
  centered?: boolean;
  padding?: boolean;
}

export class ContainerDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-container";

  render(props: ContainerDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Container {...props} dataHook={dataHook}>
        <span>Content</span>
      </Container>,
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult)
      throw new Error("ContainerDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, dataHook);
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }
}
