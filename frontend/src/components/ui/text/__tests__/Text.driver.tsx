import React from "react";
import { render, RenderResult } from "@testing-library/react";
import Text, { TextVariant, TextColor, TextWeight, TextAlign } from "../Text";
import { queryByDataHook, getByDataHook } from "@/__tests__/testUtils";

export interface TextDriverProps {
  children?: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextWeight;
  align?: TextAlign;
  truncate?: boolean;
  as?: "p" | "span" | "div" | "label" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  htmlFor?: string;
  dataHook?: string;
}

export class TextDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook: string = "test-text";

  render(props: TextDriverProps = {}): this {
    const dataHook = props.dataHook || this.defaultDataHook;
    this.renderResult = render(
      <Text {...props} dataHook={dataHook}>
        {props.children ?? "Default Text"}
      </Text>,
    );
    return this;
  }

  private getRootElement(dataHook: string = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) {
      throw new Error("TextDriver: render() must be called before querying elements");
    }
    return getByDataHook(this.renderResult.container, dataHook);
  }

  private queryRootElement(dataHook: string = this.defaultDataHook): HTMLElement | null {
    if (!this.renderResult) {
      throw new Error("TextDriver: render() must be called before querying elements");
    }
    return queryByDataHook(this.renderResult.container, dataHook);
  }

  exists(dataHook?: string): boolean {
    return this.queryRootElement(dataHook) !== null;
  }

  getText(dataHook?: string): string {
    const element = this.getRootElement(dataHook);
    return element.textContent?.trim() ?? "";
  }

  getTagName(dataHook?: string): string {
    const element = this.getRootElement(dataHook);
    return element.tagName.toLowerCase();
  }

  getClasses(dataHook?: string): string {
    const element = this.getRootElement(dataHook);
    return element.className;
  }

  hasClassName(className: string, dataHook?: string): boolean {
    const element = this.getRootElement(dataHook);
    return element.classList.contains(className);
  }

  getHtmlFor(dataHook?: string): string | null {
    const element = this.getRootElement(dataHook);
    return element.getAttribute("for");
  }
}
