import React from "react";
import { render, RenderResult } from "@testing-library/react";
import Drawer, { DrawerPlacement, DrawerSize } from "../Drawer";
import { queryByDataHook } from "@/__tests__/testUtils";

export interface DrawerDriverProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  dataHook?: string;
}

export class DrawerDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook: string = "test-drawer";

  render(props: DrawerDriverProps): this {
    const dataHook = props.dataHook || this.defaultDataHook;
    this.renderResult = render(
      <Drawer {...props} dataHook={dataHook}>
        {props.children ?? (
          <>
            <Drawer.Header onClose={props.onClose}>
              Navigation Drawer
            </Drawer.Header>
            <Drawer.Body>Drawer Body Content</Drawer.Body>
          </>
        )}
      </Drawer>,
    );
    return this;
  }

  private queryRootElement(
    dataHook: string = this.defaultDataHook,
  ): HTMLElement | null {
    // Drawer renders in a React portal to document.body
    return queryByDataHook(document.body, dataHook);
  }

  isOpen(dataHook: string = this.defaultDataHook): boolean {
    return this.queryRootElement(dataHook) !== null;
  }

  getText(dataHook: string = this.defaultDataHook): string {
    const element = queryByDataHook(document.body, dataHook);
    return element?.textContent?.trim() ?? "";
  }

  cleanUp(): void {
    if (this.renderResult) {
      this.renderResult.unmount();
    }
  }
}
