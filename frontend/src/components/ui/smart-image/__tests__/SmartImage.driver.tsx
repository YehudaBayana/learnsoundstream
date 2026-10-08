import { render, RenderResult } from '@testing-library/react';
import SmartImage, { AspectRatio, EntityType } from '../SmartImage';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface SmartImageDriverProps {
  dataHook?: string;
  src?: string | null;
  alt?: string;
  entityType?: EntityType;
  aspectRatio?: AspectRatio;
}

export class SmartImageDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-smart-image';

  render(props: SmartImageDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<SmartImage {...props} dataHook={dataHook} alt={props.alt ?? 'Cover'} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('SmartImageDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).className;
  }

  hasImageWrapper(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-image`) !== null;
  }
}