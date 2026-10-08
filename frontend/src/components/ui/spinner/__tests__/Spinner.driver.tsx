import { render, RenderResult } from '@testing-library/react';
import Spinner, { SpinnerSize, SpinnerVariant } from '../Spinner';
import { getByDataHook } from '@/__tests__/testUtils';

export interface SpinnerDriverProps {
  dataHook?: string;
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
}

export class SpinnerDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-spinner';

  render(props: SpinnerDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Spinner {...props} dataHook={dataHook} />);
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) throw new Error('SpinnerDriver: render() must be called before querying');
    return getByDataHook(this.renderResult.container, dataHook);
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }

  getAccessibleLabel(dataHook = this.defaultDataHook): string | null {
    return this.getRoot(dataHook).getAttribute('aria-label');
  }
}