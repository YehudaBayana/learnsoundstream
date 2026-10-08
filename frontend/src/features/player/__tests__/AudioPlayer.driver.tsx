import { render, RenderResult } from '@testing-library/react';
import AudioPlayer from '../components/AudioPlayer';
import { usePlaybackStore } from '../store/usePlaybackStore';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface AudioPlayerDriverProps {
  dataHook?: string;
  hasTrack?: boolean;
}

export class AudioPlayerDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'audio-player';

  render(props: AudioPlayerDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    usePlaybackStore.setState({
      currentChosenTrack: props.hasTrack ? ({ id: 'track-1' } as never) : null,
      isPlaying: false,
    });
    if (props.hasTrack) {
      jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    }
    this.renderResult = render(<AudioPlayer dataHook={dataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('AudioPlayerDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  getRootClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).className;
  }

  hasAudioElement(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-audio`) !== null;
  }
}