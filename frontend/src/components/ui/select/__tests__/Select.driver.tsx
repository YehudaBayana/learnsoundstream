import { fireEvent, render, RenderResult } from '@testing-library/react';
import Select, { SelectOption, SelectSize } from '../Select';
import { getByDataHook } from '@/__tests__/testUtils';

export interface SelectDriverProps {
  dataHook?: string;
  size?: SelectSize;
  options?: SelectOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

export class SelectDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-select';

  render(props: SelectDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Select {...props} dataHook={dataHook} />);
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLSelectElement {
    if (!this.renderResult) throw new Error('SelectDriver: render() must be called before querying');
    return getByDataHook(this.renderResult.container, dataHook) as HTMLSelectElement;
  }

  getValue(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).value;
  }

  getOptionLabels(dataHook = this.defaultDataHook): string[] {
    return Array.from(this.getRoot(dataHook).options, (option) => option.textContent?.trim() ?? '');
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }

  isDisabled(dataHook = this.defaultDataHook): boolean {
    return this.getRoot(dataHook).disabled;
  }

  changeValue(value: string, dataHook = this.defaultDataHook): void {
    fireEvent.change(this.getRoot(dataHook), { target: { value } });
  }
}