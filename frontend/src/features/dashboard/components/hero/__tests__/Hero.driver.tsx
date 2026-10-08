import { fireEvent, render, RenderResult } from "@testing-library/react";
import Hero from "../Hero";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface HeroDriverProps {
  dataHook?: string;
  onStartListening?: () => void;
  onExploreTracks?: () => void;
}

export class HeroDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "dashboard-hero";

  render(props: HeroDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Hero
        dataHook={dataHook}
        onStartListening={props.onStartListening ?? jest.fn()}
        onExploreTracks={props.onExploreTracks ?? jest.fn()}
      />,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error("HeroDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  clickStartListening(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-start-listening`));
  }

  clickExploreTracks(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-explore-tracks`));
  }
}
