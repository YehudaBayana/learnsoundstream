import React from "react";
import { render, RenderResult } from "@testing-library/react";
import Kbd, { KbdProps } from "../Kbd";
import { getByDataHook } from "@/__tests__/testUtils";

export interface KbdDriverProps extends Omit<KbdProps, "children"> {
  dataHook?: string;
  children?: React.ReactNode;
}

export class KbdDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-kbd";

  render(props: KbdDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Kbd {...props} dataHook={dataHook}>
        {props.children ?? "⌘K"}
      </Kbd>,
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) throw new Error("KbdDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, dataHook);
  }

  getText(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).textContent?.trim() ?? "";
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }
}
