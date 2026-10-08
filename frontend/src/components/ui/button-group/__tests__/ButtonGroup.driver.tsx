import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import ButtonGroup, { ButtonGroupOrientation } from '../ButtonGroup';
import { getByDataHook } from '@/__tests__/testUtils';

export interface ButtonGroupDriverProps {
  dataHook?: string;
  orientation?: ButtonGroupOrientation;
  attached?: boolean;
  gap?: 0 | 1 | 2 | 3 | 4;
  fullWidth?: boolean;
}

export class ButtonGroupDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-button-group';

  render(props: ButtonGroupDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <ButtonGroup {...props} dataHook={dataHook}>
        <button data-hook={`${dataHook}-first`}>First</button>
        <button data-hook={`${dataHook}-second`}>Second</button>
      </ButtonGroup>
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) throw new Error('ButtonGroupDriver: render() must be called before querying');
    return getByDataHook(this.renderResult.container, dataHook);
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }

  getRole(dataHook = this.defaultDataHook): string | null {
    return this.getRoot(dataHook).getAttribute('role');
  }
}