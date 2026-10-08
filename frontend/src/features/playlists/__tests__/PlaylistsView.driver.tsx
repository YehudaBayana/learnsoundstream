import { render, RenderResult } from '@testing-library/react';
import PlaylistsView from '../views/PlaylistsView';
import { queryByDataHook } from '@/__tests__/testUtils';

export class PlaylistsViewDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'playlists-view';

  render(dataHook = this.defaultDataHook): this {
    this.renderResult = render(<PlaylistsView dataHook={dataHook} />);
    return this;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    if (!this.renderResult) throw new Error('PlaylistsViewDriver: render() must be called before querying');
    return queryByDataHook(this.renderResult.container, dataHook) !== null;
  }
}