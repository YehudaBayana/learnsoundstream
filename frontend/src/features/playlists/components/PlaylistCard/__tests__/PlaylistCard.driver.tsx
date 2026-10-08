import { fireEvent, render, RenderResult } from "@testing-library/react";
import { PlaylistCard } from "../PlaylistCard";
import type { Playlist } from "@/types/global.types";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface PlaylistCardDriverProps {
  dataHook?: string;
  playlist?: Playlist;
  onClick?: (playlist: Playlist) => void;
}

export class PlaylistCardDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-playlist-card";
  private currentPlaylist: Playlist | null = null;

  render(props: PlaylistCardDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.currentPlaylist =
      props.playlist ??
      ({
        id: "playlist-1",
        title: "Focus mix",
        description: "",
        uploader: "Soundstream",
        channel: "Soundstream",
        channelId: "channel-1",
        webpageUrl: "/playlists/playlist-1",
        thumbnails: [],
        playlist_count: 0,
        trackCount: 0,
      } as Playlist);
    this.renderResult = render(
      <PlaylistCard
        pl={this.currentPlaylist}
        onClick={props.onClick ?? jest.fn()}
        dataHook={dataHook}
      />,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error(
        "PlaylistCardDriver: render() must be called before querying",
      );
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  click(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), dataHook));
  }

  getPlaylist(): Playlist {
    if (!this.currentPlaylist)
      throw new Error(
        "PlaylistCardDriver: render() must be called before querying",
      );
    return this.currentPlaylist;
  }
}
