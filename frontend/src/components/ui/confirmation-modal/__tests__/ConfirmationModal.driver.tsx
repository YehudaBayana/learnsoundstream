import { fireEvent } from '@testing-library/react';
import { render, RenderResult } from '@testing-library/react';
import ConfirmationModal from '../ConfirmationModal';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface ConfirmationModalDriverProps {
  dataHook?: string;
  isOpen?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

export class ConfirmationModalDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-confirmation-modal';

  render(props: ConfirmationModalDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <ConfirmationModal
        isOpen={props.isOpen ?? true}
        onClose={props.onClose ?? jest.fn()}
        onConfirm={props.onConfirm ?? jest.fn()}
        title={props.title ?? 'Confirm action'}
        description={props.description ?? 'Proceed with this action?'}
        confirmLabel={props.confirmLabel}
        cancelLabel={props.cancelLabel}
        isDanger={props.isDanger}
        isLoading={props.isLoading}
        dataHook={dataHook}
      />
    );
    return this;
  }

  private getRenderResult(): RenderResult {
    if (!this.renderResult) {
      throw new Error('ConfirmationModalDriver: render() must be called before querying elements');
    }
    return this.renderResult;
  }

  isOpen(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(document.body, dataHook) !== null;
  }

  getText(dataHook = this.defaultDataHook): string {
    return getByDataHook(document.body, dataHook).textContent?.trim() ?? '';
  }

  isConfirmDisabled(dataHook = this.defaultDataHook): boolean {
    return (getByDataHook(document.body, `${dataHook}-confirm-button`) as HTMLButtonElement).disabled;
  }

  clickConfirm(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(document.body, `${dataHook}-confirm-button`));
  }

  clickCancel(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(document.body, `${dataHook}-cancel-button`));
  }

  isMounted(): boolean {
    return this.getRenderResult().container !== null;
  }
}