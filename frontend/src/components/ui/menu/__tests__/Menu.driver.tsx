import React from 'react';
import { fireEvent, render, RenderResult } from '@testing-library/react';
import Menu, { MenuPlacement } from '../Menu';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface MenuDriverProps {
  dataHook?: string;
  placement?: MenuPlacement;
  onItemClick?: () => void;
}

export class MenuDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-menu';

  render(props: MenuDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Menu dataHook={dataHook} placement={props.placement}
        trigger={<button type="button">Open menu</button>}>
        <Menu.Item dataHook={`${dataHook}-item`} onClick={props.onItemClick ?? jest.fn()}>First item</Menu.Item>
      </Menu>
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('MenuDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  isOpen(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(document.body, `${dataHook}-menu`) !== null;
  }

  clickTrigger(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-trigger`));
  }

  clickItem(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(document.body, `${dataHook}-item`));
  }
}