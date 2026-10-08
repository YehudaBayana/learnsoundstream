import { act, fireEvent, render, RenderResult } from '@testing-library/react';
import Image, { ImageFit } from '../Image';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface ImageDriverProps {
  dataHook?: string;
  src?: string;
  alt?: string;
  fit?: ImageFit;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showSkeleton?: boolean;
}

export class ImageDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-image';

  render(props: ImageDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Image src={props.src ?? '/cover.png'} alt={props.alt ?? 'Cover'} fit={props.fit} rounded={props.rounded}
        showSkeleton={props.showSkeleton} lazy={false} dataHook={dataHook} />
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('ImageDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  hasRoot(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  hasImage(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-image`) !== null;
  }

  getImageClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-image`).className;
  }

  getRootClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).className;
  }

  hasSkeleton(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-skeleton`) !== null;
  }

  async loadImage(dataHook = this.defaultDataHook): Promise<void> {
    await act(async () => {
      fireEvent.load(getByDataHook(this.getContainer(), `${dataHook}-image`));
    });
  }
}