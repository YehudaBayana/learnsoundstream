import React from 'react';
import { fireEvent, render, RenderResult } from '@testing-library/react';
import Tabs, { TabsVariant } from '../Tabs';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface TabsDriverProps {
  dataHook?: string;
  variant?: TabsVariant;
  disabledTab?: string;
  onTabChange?: (tab: string) => void;
}

export class TabsDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-tabs';

  render(props: TabsDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Tabs dataHook={dataHook} variant={props.variant} defaultTab="one" onTabChange={props.onTabChange}>
        <Tabs.List dataHook={`${dataHook}-list`}>
          <Tabs.Tab id="one" dataHook={`${dataHook}-tab-one`}>One</Tabs.Tab>
          <Tabs.Tab id="two" disabled={props.disabledTab === 'two'} dataHook={`${dataHook}-tab-two`}>Two</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="one" dataHook={`${dataHook}-panel-one`}>First panel</Tabs.Panel>
        <Tabs.Panel id="two" dataHook={`${dataHook}-panel-two`}>Second panel</Tabs.Panel>
      </Tabs>
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('TabsDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  isSelected(id: 'one' | 'two', dataHook = this.defaultDataHook): boolean {
    return getByDataHook(this.getContainer(), `${dataHook}-tab-${id}`).getAttribute('aria-selected') === 'true';
  }

  isPanelVisible(id: 'one' | 'two', dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-panel-${id}`) !== null;
  }

  getListClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-list`).className;
  }

  clickTab(id: 'one' | 'two', dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-tab-${id}`));
  }
}