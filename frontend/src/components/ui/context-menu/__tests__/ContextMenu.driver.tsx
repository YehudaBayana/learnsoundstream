import React from 'react';
import { fireEvent, render, RenderResult } from '@testing-library/react';
import ContextMenu, { ContextMenuDivider, ContextMenuItem } from '../ContextMenu';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface ContextMenuDriverProps {
  dataHook?: string;
  disabled?: boolean;
  onFirstItemClick?: () => void;
}

export class ContextMenuDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-context-menu';

  render(props: ContextMenuDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <ContextMenu
        dataHook={dataHook}
        disabled={props.disabled}
        content={(
          <>
            <ContextMenuItem dataHook={`${dataHook}-first-item`} onClick={props.onFirstItemClick ?? jest.fn()}>
              First action
            </ContextMenuItem>
            <ContextMenuDivider dataHook={`${dataHook}-divider`} />
            <ContextMenuItem dataHook={`${dataHook}-second-item`}>Second action</ContextMenuItem>
          </>
        )}
      >
        <span>Trigger</span>
      </ContextMenu>
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) {
      throw new Error('ContextMenuDriver: render() must be called before querying elements');
    }
    return this.renderResult.container;
  }

  hasTrigger(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  isMenuOpen(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(document.body, `${dataHook}-menu`) !== null;
  }

  hasItem(item: 'first' | 'second', dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(document.body, `${dataHook}-${item}-item`) !== null;
  }

  clickItem(item: 'first' | 'second', dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(document.body, `${dataHook}-${item}-item`));
  }

  rightClickTrigger(dataHook = this.defaultDataHook): void {
    fireEvent.contextMenu(getByDataHook(this.getContainer(), dataHook));
  }

  clickOutside(): void {
    fireEvent.mouseDown(document.body);
  }
}