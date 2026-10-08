import { render, RenderResult } from '@testing-library/react';
import PlaylistDetailView from '../views/PlaylistDetailView';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface PlaylistDetailViewDriverProps {
  dataHook?: string;
}

export class PlaylistDetailViewDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'playlist-detail-view';

  render(props: PlaylistDetailViewDriverProps = {}): this {
    this.renderResult = render(<PlaylistDetailView dataHook={props.dataHook ?? this.defaultDataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('PlaylistDetailViewDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  hasTitle(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-title`) !== null;
  }

  isTracksLoading(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-tracks-loading`) !== null;
  }

  isTracksEmpty(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-tracks-empty`) !== null;
  }

  getTrackError(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-tracks-error`).textContent?.trim() ?? '';
  }
}