import React from "react";
import { render, RenderResult, fireEvent } from "@testing-library/react";
import Button, { ButtonVariant, ButtonSize } from "../Button";
import { queryByDataHook, getByDataHook } from "@/__tests__/testUtils";

export interface ButtonDriverProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  dataHook?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export class ButtonDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook: string = "test-button";

  render(props: ButtonDriverProps = {}): this {
    const dataHook = props.dataHook || this.defaultDataHook;
    this.renderResult = render(
      <Button {...props} dataHook={dataHook}>
        {props.children ?? "Click me"}
      </Button>,
    );
    return this;
  }

  private getRootElement(dataHook: string = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) {
      throw new Error(
        "ButtonDriver: render() must be called before querying elements",
      );
    }
    return getByDataHook(this.renderResult.container, dataHook);
  }

  private queryRootElement(
    dataHook: string = this.defaultDataHook,
  ): HTMLElement | null {
    if (!this.renderResult) {
      throw new Error(
        "ButtonDriver: render() must be called before querying elements",
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

  isDisabled(dataHook?: string): boolean {
    const element = this.getRootElement(dataHook) as HTMLButtonElement;
    return element.disabled;
  }

  getType(dataHook?: string): string | null {
    const element = this.getRootElement(dataHook);
    return element.getAttribute("type");
  }

  getClasses(dataHook?: string): string {
    const element = this.getRootElement(dataHook);
    return element.className;
  }

  hasClassName(className: string, dataHook?: string): boolean {
    const element = this.getRootElement(dataHook);
    return element.classList.contains(className);
  }

  click(dataHook?: string): void {
    const element = this.getRootElement(dataHook);
    fireEvent.click(element);
  }
}
