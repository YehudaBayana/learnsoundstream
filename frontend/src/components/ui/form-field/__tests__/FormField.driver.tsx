import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import FormField from '../FormField';
import { queryByDataHook } from '@/__tests__/testUtils';

export interface FormFieldDriverProps {
  dataHook?: string;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export class FormFieldDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-form-field';

  render(props: FormFieldDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <FormField {...props} dataHook={dataHook}>
        <input data-hook={`${dataHook}-control`} />
      </FormField>
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('FormFieldDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  hasControl(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-control`) !== null;
  }

  hasMessage(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-message`) !== null;
  }
}