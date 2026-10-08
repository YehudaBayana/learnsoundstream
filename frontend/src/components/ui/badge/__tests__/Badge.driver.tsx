import React from "react";
import { render, RenderResult, fireEvent } from "@testing-library/react";
import Badge, { BadgeVariant, BadgeSize } from "../Badge";
import { queryByDataHook, getByDataHook } from "@/__tests__/testUtils";

export interface BadgeDriverProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  outlined?: boolean;
  pill?: boolean;
  dot?: boolean;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  dataHook?: string;
}

export class BadgeDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook: string = "test-badge";

  render(props: BadgeDriverProps = {}): this {
    const dataHook = props.dataHook || this.defaultDataHook;
    this.renderResult = render(
      <Badge {...props} dataHook={dataHook}>
        {props.children ?? "Badge Content"}
      </Badge>,
    );
    return this;
  }

  private getRootElement(dataHook: string = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) {
      throw new Error(
        "BadgeDriver: render() must be called before querying elements",
      );
    }
    return getByDataHook(this.renderResult.container, dataHook);
  }

  private queryRootElement(
    dataHook: string = this.defaultDataHook,
  ): HTMLElement | null {
    if (!this.renderResult) {
      throw new Error(
        "BadgeDriver: render() must be called before querying elements",
      );
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

  getClasses(dataHook?: string): string {
    const element = this.getRootElement(dataHook);
    return element.className;
  }

  hasClassName(className: string, dataHook?: string): boolean {
    const element = this.getRootElement(dataHook);
    return element.classList.contains(className);
  }

  isPill(dataHook?: string): boolean {
    return this.hasClassName("rounded-full", dataHook);
  }

  isOutlined(dataHook?: string): boolean {
    return this.hasClassName("bg-transparent", dataHook);
  }

  clickRemove(dataHook?: string): void {
    const rootElement = this.getRootElement(dataHook);
    const removeButton = rootElement.querySelector("button");
    if (!removeButton) {
      throw new Error("BadgeDriver: Remove button not found on badge");
    }
    fireEvent.click(removeButton);
  }

  hasRemoveButton(dataHook?: string): boolean {
    const rootElement = this.getRootElement(dataHook);
    return rootElement.querySelector("button") !== null;
  }
}
