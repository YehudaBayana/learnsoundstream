import { fireEvent, render, RenderResult } from '@testing-library/react';
import IconButton, { IconButtonSize, IconButtonVariant } from '../IconButton';
import { getByDataHook } from '@/__tests__/testUtils';

export interface IconButtonDriverProps {
  dataHook?: string;
  label?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  disabled?: boolean;
  rounded?: boolean;
  onClick?: () => void;
}

export class IconButtonDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-icon-button';

  render(props: IconButtonDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <IconButton aria-label={props.label ?? 'Play'} dataHook={dataHook} variant={props.variant}
        size={props.size} loading={props.loading} disabled={props.disabled} rounded={props.rounded}
        onClick={props.onClick}>
        <span>Icon</span>
      </IconButton>
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLButtonElement {
    if (!this.renderResult) throw new Error('IconButtonDriver: render() must be called before querying');
    return getByDataHook(this.renderResult.container, dataHook) as HTMLButtonElement;
  }

  isDisabled(dataHook = this.defaultDataHook): boolean {
    return this.getRoot(dataHook).disabled;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }

  click(dataHook = this.defaultDataHook): void {
    fireEvent.click(this.getRoot(dataHook));
  }
}