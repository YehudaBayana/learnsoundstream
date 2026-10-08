import React from "react";
import { render, RenderResult, fireEvent } from "@testing-library/react";
import Dialog, { DialogVariant } from "../Dialog";
import { queryByDataHook, getByDataHook } from "@/__tests__/testUtils";

export interface DialogDriverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  variant?: DialogVariant;
  showIcon?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  loading?: boolean;
  loadingText?: string;
  hideCancel?: boolean;
  children?: React.ReactNode;
  id?: string;
  dataHook?: string;
}

export class DialogDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook: string = "test-dialog";

  render(props: DialogDriverProps): this {
    const dataHook = props.dataHook || this.defaultDataHook;
    this.renderResult = render(<Dialog {...props} dataHook={dataHook} />);
    return this;
  }

  private getRootElement(dataHook: string = this.defaultDataHook): HTMLElement {
    // Modal is rendered into document.body portal
    return getByDataHook(document.body, dataHook);
  }

  private queryRootElement(
    dataHook: string = this.defaultDataHook,
  ): HTMLElement | null {
    return queryByDataHook(document.body, dataHook);
  }

  isOpen(dataHook: string = this.defaultDataHook): boolean {
    return this.queryRootElement(dataHook) !== null;
  }

  getTitle(dataHook: string = this.defaultDataHook): string {
    const titleElement = getByDataHook(document.body, `${dataHook}-title`);
    return titleElement.textContent?.trim() ?? "";
  }

  getDescription(dataHook: string = this.defaultDataHook): string {
    const descElement = getByDataHook(document.body, `${dataHook}-description`);
    return descElement.textContent?.trim() ?? "";
  }

  clickConfirm(dataHook: string = this.defaultDataHook): void {
    const confirmBtn = getByDataHook(document.body, `${dataHook}-confirm-btn`);
    fireEvent.click(confirmBtn);
  }

  clickCancel(dataHook: string = this.defaultDataHook): void {
    const cancelBtn = getByDataHook(document.body, `${dataHook}-cancel-btn`);
    fireEvent.click(cancelBtn);
  }

  clickClose(dataHook: string = this.defaultDataHook): void {
    const closeBtn = getByDataHook(document.body, `${dataHook}-close-btn`);
    fireEvent.click(closeBtn);
  }

  hasCancelButton(dataHook: string = this.defaultDataHook): boolean {
    return queryByDataHook(document.body, `${dataHook}-cancel-btn`) !== null;
  }

  hasCloseButton(dataHook: string = this.defaultDataHook): boolean {
    return queryByDataHook(document.body, `${dataHook}-close-btn`) !== null;
  }

  getConfirmButtonText(dataHook: string = this.defaultDataHook): string {
    const confirmBtn = getByDataHook(document.body, `${dataHook}-confirm-btn`);
    return confirmBtn.textContent?.trim() ?? "";
  }

  cleanUp(): void {
    if (this.renderResult) {
      this.renderResult.unmount();
    }
  }
}
