import { fireEvent, render, RenderResult } from '@testing-library/react';
import ListItem from '../ListItem';
import { getByDataHook } from '@/__tests__/testUtils';

export interface ListItemDriverProps {
  dataHook?: string;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export class ListItemDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-list-item';

  render(props: ListItemDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <ListItem {...props} dataHook={dataHook} secondaryText="Secondary detail">
        Track title
      </ListItem>
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) throw new Error('ListItemDriver: render() must be called before querying');
    return getByDataHook(this.renderResult.container, dataHook);
  }

  getTagName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).tagName;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }

  isDisabled(dataHook = this.defaultDataHook): boolean {
    return (this.getRoot(dataHook) as HTMLButtonElement).disabled;
  }

  click(dataHook = this.defaultDataHook): void {
    fireEvent.click(this.getRoot(dataHook));
  }
}