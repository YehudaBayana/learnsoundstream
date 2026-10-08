import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import List, { ListSpacing, ListVariant } from '../List';
import { getByDataHook } from '@/__tests__/testUtils';

export interface ListDriverProps {
  dataHook?: string;
  ordered?: boolean;
  variant?: ListVariant;
  spacing?: ListSpacing;
}

export class ListDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-list';

  render(props: ListDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <List {...props} dataHook={dataHook}>
        <li data-hook={`${dataHook}-item`}>First item</li>
      </List>
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) throw new Error('ListDriver: render() must be called before querying');
    return getByDataHook(this.renderResult.container, dataHook);
  }

  getTagName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).tagName;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }

  hasItem(dataHook = this.defaultDataHook): boolean {
    if (!this.renderResult) throw new Error('ListDriver: render() must be called before querying');
    return this.renderResult.container.querySelector(`[data-hook="${dataHook}-item"]`) !== null;
  }
}