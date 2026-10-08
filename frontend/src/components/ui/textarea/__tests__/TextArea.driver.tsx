import { fireEvent, render, RenderResult } from '@testing-library/react';
import TextArea, { TextAreaSize, TextAreaVariant } from '../TextArea';
import { getByDataHook } from '@/__tests__/testUtils';

export interface TextAreaDriverProps {
  dataHook?: string;
  size?: TextAreaSize;
  variant?: TextAreaVariant;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  error?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

export class TextAreaDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-textarea';

  render(props: TextAreaDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<TextArea {...props} dataHook={dataHook} />);
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLTextAreaElement {
    if (!this.renderResult) throw new Error('TextAreaDriver: render() must be called before querying');
    return getByDataHook(this.renderResult.container, dataHook) as HTMLTextAreaElement;
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