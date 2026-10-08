import { fireEvent, render, RenderResult } from '@testing-library/react';
import RadioGroup, { RadioOption, RadioGroupOrientation } from '../RadioGroup';
import { getByDataHook } from '@/__tests__/testUtils';

export interface RadioGroupDriverProps {
  dataHook?: string;
  options?: RadioOption[];
  value?: string;
  orientation?: RadioGroupOrientation;
  onChange?: (value: string) => void;
}

export class RadioGroupDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-radio-group';

  render(props: RadioGroupDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <RadioGroup dataHook={dataHook} name="test-options" value={props.value} orientation={props.orientation}
        options={props.options ?? [{ value: 'one', label: 'One' }, { value: 'two', label: 'Two' }]} onChange={props.onChange} />
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('RadioGroupDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).className;
  }

  isOptionChecked(value: string, dataHook = this.defaultDataHook): boolean {
    return (getByDataHook(this.getContainer(), `${dataHook}-${value}-input`) as HTMLInputElement).checked;
  }

  selectOption(value: string, dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-${value}-input`));
  }
}