import { fireEvent, render, RenderResult } from '@testing-library/react';
import TrackItem from '../TrackItem';
import { usePlaybackStore } from '@/features/player/store/usePlaybackStore';
import type { Track } from '@/types/global.types';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface TrackItemDriverProps {
  dataHook?: string;
  track?: Track;
  isCurrent?: boolean;
  isPlaying?: boolean;
}

export class TrackItemDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-track-item';
  private currentTrack: Track | null = null;

  render(props: TrackItemDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.currentTrack = props.track ?? ({ id: 'track-1', title: 'Track title', duration: 180, thumbnail: '' } as Track);
    usePlaybackStore.setState({
      currentChosenTrack: props.isCurrent ? this.currentTrack : null,
      isPlaying: props.isPlaying ?? false,
    });
    this.renderResult = render(
      <TrackItem track={this.currentTrack} showCover={false} dataHook={dataHook} />
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('TrackItemDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  getTitle(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-title`).textContent?.trim() ?? '';
  }

  clickPlay(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-play-button`));
  }

  clickLike(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-like-button`));
  }
}