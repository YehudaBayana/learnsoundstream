import { createRef } from "react";
import { fireEvent, render, RenderResult } from "@testing-library/react";
import AudioPlayerControls from "../AudioPlayerControls";
import type { Track } from "@/types/global.types";
import { getByDataHook } from "@/__tests__/testUtils";

export interface AudioPlayerControlsDriverProps {
  dataHook?: string;
  currentTrack?: Track | null;
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

export class AudioPlayerControlsDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-player-controls";

  render(props: AudioPlayerControlsDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <AudioPlayerControls
        currentTrack={props.currentTrack ?? null}
        isPlaying={props.isPlaying ?? false}
        isLoading={false}
        currentTime={0}
        duration={120}
        error={null}
        progressRef={createRef<HTMLInputElement>()}
        onPlayPause={props.onPlayPause ?? jest.fn()}
        onSeek={jest.fn()}
        onDragStart={jest.fn()}
        onDragEnd={jest.fn()}
        dataHook={dataHook}
      />,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("AudioPlayerControlsDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  isPlayPauseDisabled(dataHook = this.defaultDataHook): boolean {
    return (getByDataHook(this.getContainer(), `${dataHook}-play-pause`) as HTMLButtonElement)
      .disabled;
  }

  hasSeekSlider(dataHook = this.defaultDataHook): boolean {
    return getByDataHook(this.getContainer(), `${dataHook}-seek-slider`).tagName === "INPUT";
  }

  clickPlayPause(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-play-pause`));
  }
}
