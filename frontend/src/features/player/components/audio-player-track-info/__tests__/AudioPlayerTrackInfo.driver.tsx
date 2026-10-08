import { render, RenderResult } from "@testing-library/react";
import AudioPlayerTrackInfo from "../AudioPlayerTrackInfo";
import type { Track } from "@/types/global.types";
import { getByDataHook } from "@/__tests__/testUtils";

export interface AudioPlayerTrackInfoDriverProps {
  dataHook?: string;
  track?: Track | null;
  isPlaying?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
}

export class AudioPlayerTrackInfoDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-track-info";

  render(props: AudioPlayerTrackInfoDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <AudioPlayerTrackInfo
        track={props.track ?? null}
        isPlaying={props.isPlaying ?? false}
        isLoading={props.isLoading ?? false}
        hasError={props.hasError ?? false}
        dataHook={dataHook}
      />,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("AudioPlayerTrackInfoDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  getTitle(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-title`).textContent?.trim() ?? "";
  }

  getStatus(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-status`).textContent?.trim() ?? "";
  }
}
