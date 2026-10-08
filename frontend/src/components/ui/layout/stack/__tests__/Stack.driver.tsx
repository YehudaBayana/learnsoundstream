import React from "react";
import { render, RenderResult } from "@testing-library/react";
import Stack, { StackDirection, StackGap } from "../Stack";
import { getByDataHook } from "@/__tests__/testUtils";

export interface StackDriverProps {
  dataHook?: string;
  direction?: StackDirection;
  gap?: StackGap;
  wrap?: boolean;
}

export class StackDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-stack";

  render(props: StackDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Stack {...props} dataHook={dataHook}>
        Content
      </Stack>,
    );
    return this;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    if (!this.renderResult) throw new Error("StackDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, dataHook).className;
  }
}
