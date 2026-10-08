import { act, fireEvent, render, RenderResult } from '@testing-library/react';
import Toast from '../Toast';
import type { Toast as ToastData } from '@/store/useToastStore';
import { getByDataHook } from '@/__tests__/testUtils';

export interface ToastDriverProps {
  dataHook?: string;
  toast?: ToastData;
  onDismiss?: (id: string) => void;
}

export class ToastDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-toast';

  render(props: ToastDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Toast dataHook={dataHook} toast={props.toast ?? { id: 'toast-1', message: 'Saved', variant: 'success' }}
        onDismiss={props.onDismiss ?? jest.fn()} />
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('ToastDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return getByDataHook(this.getContainer(), dataHook) !== null;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).className;
  }

  clickDismiss(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-dismiss`));
  }

  advanceDismissAnimation(): void {
    act(() => jest.advanceTimersByTime(200));
  }
}