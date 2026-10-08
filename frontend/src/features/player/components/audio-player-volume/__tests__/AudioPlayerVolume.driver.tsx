import { fireEvent, render, RenderResult } from '@testing-library/react';
import AudioPlayerVolume from '../AudioPlayerVolume';
import { getByDataHook } from '@/__tests__/testUtils';

export interface AudioPlayerVolumeDriverProps {
  dataHook?: string;
  hasTrack?: boolean;
  isMuted?: boolean;
  volume?: number;
  onToggleMute?: () => void;
}

export class AudioPlayerVolumeDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-player-volume';

  render(props: AudioPlayerVolumeDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<AudioPlayerVolume dataHook={dataHook} hasTrack={props.hasTrack ?? false}
      isMuted={props.isMuted ?? false} volume={props.volume ?? 0.8}
      onToggleMute={props.onToggleMute ?? jest.fn()} onVolumeChange={jest.fn()} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('AudioPlayerVolumeDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  isMuteDisabled(dataHook = this.defaultDataHook): boolean {
    return (getByDataHook(this.getContainer(), `${dataHook}-mute`) as HTMLButtonElement).disabled;
  }

  hasVolumeSlider(dataHook = this.defaultDataHook): boolean {
    return getByDataHook(this.getContainer(), `${dataHook}-volume-slider`).tagName === 'INPUT';
  }

  clickMute(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-mute`));
  }
}