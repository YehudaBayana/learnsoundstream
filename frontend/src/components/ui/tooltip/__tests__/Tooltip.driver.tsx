import { fireEvent, render, RenderResult } from "@testing-library/react";
import Tooltip, { TooltipPlacement } from "../Tooltip";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface TooltipDriverProps {
  dataHook?: string;
  disabled?: boolean;
  placement?: TooltipPlacement;
  content?: string;
}

export class TooltipDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-tooltip";

  render(props: TooltipDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Tooltip
        content={props.content ?? "Tooltip content"}
        disabled={props.disabled}
        placement={props.placement}
        dataHook={dataHook}
      >
        <span>Trigger</span>
      </Tooltip>,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("TooltipDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  isVisible(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(document.body, `${dataHook}-tooltip`) !== null;
  }

  hover(dataHook = this.defaultDataHook): void {
    fireEvent.mouseEnter(getByDataHook(this.getContainer(), dataHook));
  }

  leave(dataHook = this.defaultDataHook): void {
    fireEvent.mouseLeave(getByDataHook(this.getContainer(), dataHook));
  }

  focus(dataHook = this.defaultDataHook): void {
    fireEvent.focus(getByDataHook(this.getContainer(), dataHook));
  }
}
