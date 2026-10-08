import React from 'react';
import { render, RenderResult, fireEvent } from '@testing-library/react';
import { Carousel } from './Carousel';
import { queryByDataHook, getByDataHook } from '@/__tests__/testUtils';

export interface CarouselDriverProps {
  children?: React.ReactNode;
  className?: string;
  itemWidth?: string;
  dataHook?: string;
}

export class CarouselDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook: string = 'test-carousel';

  render(props: CarouselDriverProps = {}): this {
    const dataHook = props.dataHook || this.defaultDataHook;
    this.renderResult = render(
      <Carousel {...props} dataHook={dataHook}>
        {props.children ?? (
          <>
            <div>Item 1</div>
            <div>Item 2</div>
            <div>Item 3</div>
          </>
        )}
      </Carousel>
    );
    return this;
  }

  private getRootElement(dataHook: string = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) {
      throw new Error('CarouselDriver: render() must be called before querying elements');
    }
    return getByDataHook(this.renderResult.container, dataHook);
  }

  exists(dataHook: string = this.defaultDataHook): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, dataHook) !== null;
  }

  hasPrevButton(dataHook: string = this.defaultDataHook): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, `${dataHook}-prev-btn`) !== null;
  }

  hasNextButton(dataHook: string = this.defaultDataHook): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, `${dataHook}-next-btn`) !== null;
  }

  clickNext(dataHook: string = this.defaultDataHook): void {
    if (!this.renderResult) {
      throw new Error('CarouselDriver: render() must be called');
    }
    const nextBtn = getByDataHook(this.renderResult.container, `${dataHook}-next-btn`);
    fireEvent.click(nextBtn);
  }

  clickPrev(dataHook: string = this.defaultDataHook): void {
    if (!this.renderResult) {
      throw new Error('CarouselDriver: render() must be called');
    }
    const prevBtn = getByDataHook(this.renderResult.container, `${dataHook}-prev-btn`);
    fireEvent.click(prevBtn);
  }

  getScrollContainer(dataHook: string = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) {
      throw new Error('CarouselDriver: render() must be called');
    }
    return getByDataHook(this.renderResult.container, `${dataHook}-scroll-container`);
  }
}
