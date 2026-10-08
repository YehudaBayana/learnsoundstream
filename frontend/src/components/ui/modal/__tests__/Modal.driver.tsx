import React from "react";
import { fireEvent, render, RenderResult } from "@testing-library/react";
import Modal, { ModalSize } from "../Modal";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface ModalDriverProps {
  dataHook?: string;
  isOpen?: boolean;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  onClose?: () => void;
}

export class ModalDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-modal";
  private currentProps: ModalDriverProps = {};

  render(props: ModalDriverProps = {}): this {
    this.currentProps = props;
    this.renderResult = render(this.createModal(props));
    return this;
  }

  private createModal(props: ModalDriverProps): React.ReactElement {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    return (
      <Modal
        isOpen={props.isOpen ?? true}
        onClose={props.onClose ?? jest.fn()}
        size={props.size}
        closeOnBackdrop={props.closeOnBackdrop}
        closeOnEscape={props.closeOnEscape}
        preventScroll={props.preventScroll}
        dataHook={dataHook}
      >
        <Modal.Header dataHook={`${dataHook}-header`}>Modal title</Modal.Header>
        <Modal.Body dataHook={`${dataHook}-body`}>Modal content</Modal.Body>
        <Modal.Footer dataHook={`${dataHook}-footer`}>Modal actions</Modal.Footer>
      </Modal>
    );
  }

  private getRenderResult(): RenderResult {
    if (!this.renderResult) throw new Error("ModalDriver: render() must be called before querying");
    return this.renderResult;
  }

  isOpen(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(document.body, dataHook) !== null;
  }

  hasSection(section: "header" | "body" | "footer", dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(document.body, `${dataHook}-${section}`) !== null;
  }

  getPanelClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(document.body, `${dataHook}-panel`).className;
  }

  clickCloseButton(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(document.body, `${dataHook}-header-close-button`));
  }

  clickBackdrop(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(document.body, `${dataHook}-backdrop`));
  }

  pressEscape(): void {
    fireEvent.keyDown(document, { key: "Escape" });
  }

  setOpen(isOpen: boolean): void {
    this.currentProps = { ...this.currentProps, isOpen };
    this.getRenderResult().rerender(this.createModal(this.currentProps));
  }
}
