import { act, renderHook } from '@testing-library/react';
import { ModalState, useModal } from '../useModal';

export class UseModalDriver {
  private state: { current: ModalState } | null = null;

  render(initialState = false): this {
    const hookResult = renderHook(() => useModal(initialState));
    this.state = hookResult.result;
    return this;
  }

  private getState(): ModalState {
    if (!this.state) throw new Error('UseModalDriver: render() must be called before querying');
    return this.state.current;
  }

  isOpen(): boolean {
    return this.getState().isOpen;
  }

  open(): void {
    act(() => this.getState().open());
  }

  close(): void {
    act(() => this.getState().close());
  }

  toggle(): void {
    act(() => this.getState().toggle());
  }

  setOpen(isOpen: boolean): void {
    act(() => this.getState().setIsOpen(isOpen));
  }
}