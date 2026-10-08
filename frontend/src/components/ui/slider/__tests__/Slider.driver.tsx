import { fireEvent, render, RenderResult } from '@testing-library/react';
import Slider, { SliderSize } from '../Slider';
import { getByDataHook } from '@/__tests__/testUtils';

export interface SliderDriverProps {
  dataHook?: string;
  size?: SliderSize;
  value?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export class SliderDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-slider';

  render(props: SliderDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Slider {...props} value={props.value ?? 50} dataHook={dataHook} />);
    return this;
  }

  private getElement(suffix = '-slider', dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) throw new Error('SliderDriver: render() must be called before querying');
    return getByDataHook(this.renderResult.container, `${dataHook}${suffix}`);
  }

  getValue(dataHook = this.defaultDataHook): string {
    return (this.getElement('-slider', dataHook) as HTMLInputElement).value;
  }

  getMin(dataHook = this.defaultDataHook): string {
    return (this.getElement('-slider', dataHook) as HTMLInputElement).min;
  }

  getMax(dataHook = this.defaultDataHook): string {
    return (this.getElement('-slider', dataHook) as HTMLInputElement).max;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getElement('-slider', dataHook).className;
  }

  isDisabled(dataHook = this.defaultDataHook): boolean {
    return (this.getElement('-slider', dataHook) as HTMLInputElement).disabled;
  }

  changeValue(value: string, dataHook = this.defaultDataHook): void {
    fireEvent.change(this.getElement('-slider', dataHook), { target: { value } });
  }
}