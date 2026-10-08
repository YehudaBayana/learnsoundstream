import React from "react";
import { render, RenderResult } from "@testing-library/react";
import Flex, { FlexDirection } from "../Flex";
import { getByDataHook } from "@/__tests__/testUtils";

export interface FlexDriverProps {
  dataHook?: string;
  direction?: FlexDirection;
  gap?: number;
  as?: "div" | "section";
}

export class FlexDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-flex";

  render(props: FlexDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Flex {...props} dataHook={dataHook}>
        Content
      </Flex>,
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult)
      throw new Error("FlexDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, dataHook);
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }

  getTagName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).tagName;
  }
}
