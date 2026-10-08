import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import Heading, {
  HeadingAlign,
  HeadingColor,
  HeadingLevel,
  HeadingSize,
  HeadingWeight,
} from '../Heading';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface HeadingDriverProps {
  dataHook?: string;
  children?: React.ReactNode;
  level?: HeadingLevel;
  size?: HeadingSize;
  color?: HeadingColor;
  weight?: HeadingWeight;
  align?: HeadingAlign;
  truncate?: boolean;
  className?: string;
  id?: string;
}

export class HeadingDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-heading';

  render(props: HeadingDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Heading {...props} dataHook={dataHook}>{props.children ?? 'Heading'}</Heading>);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) {
      throw new Error('HeadingDriver: render() must be called before querying elements');
    }
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  getTagName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).tagName;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).className;
  }

  getText(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).textContent?.trim() ?? '';
  }

  getId(dataHook = this.defaultDataHook): string | null {
    return getByDataHook(this.getContainer(), dataHook).getAttribute('id');
  }
}