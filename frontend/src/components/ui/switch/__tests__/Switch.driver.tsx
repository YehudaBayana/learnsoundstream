import { fireEvent, render, RenderResult } from '@testing-library/react';
import Switch, { SwitchSize } from '../Switch';
import { getByDataHook } from '@/__tests__/testUtils';

export interface SwitchDriverProps {
  dataHook?: string;
  size?: SwitchSize;
  label?: string;
  labelPosition?: 'left' | 'right';
  checked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export class SwitchDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-switch';

  render(props: SwitchDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Switch {...props} dataHook={dataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('SwitchDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  isChecked(dataHook = this.defaultDataHook): boolean {
    return getByDataHook(this.getContainer(), `${dataHook}-input`).getAttribute('aria-checked') === 'true';
  }

  isDisabled(dataHook = this.defaultDataHook): boolean {
    return (getByDataHook(this.getContainer(), `${dataHook}-input`) as HTMLInputElement).disabled;
  }

  getRootClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).className;
  }

  toggle(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-input`));
  }
}