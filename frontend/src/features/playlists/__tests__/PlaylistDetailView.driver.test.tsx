import { PlaylistDetailViewDriver } from "./PlaylistDetailView.driver";
import { useParams } from "next/navigation";
import { usePlaylistDetails, usePlaylistTracks } from "../query/usePlaylists";

jest.mock("next/navigation", () => ({ useParams: jest.fn() }));
jest.mock("../query/usePlaylists");
jest.mock("@/features/player/components/TrackItem", () => ({
  __esModule: true,
  default: () => <div />,
}));

describe("PlaylistDetailView", () => {
  let driver: PlaylistDetailViewDriver;
  const playlistDetails = {
    id: "playlist-1",
    title: "Focus mix",
    description: "Instrumental tracks",
    uploader: "Soundstream",
    thumbnails: [],
    playlist_count: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: "playlist-1" });
    (usePlaylistDetails as jest.Mock).mockReturnValue({ data: playlistDetails });
    (usePlaylistTracks as jest.Mock).mockReturnValue({ data: [], isLoading: false, error: null });
    driver = new PlaylistDetailViewDriver();
  });

  it("renders playlist details under a configurable feature hook", () => {
    driver.render({ dataHook: "focus-playlist" });
    expect(driver.exists("focus-playlist")).toBe(true);
    expect(driver.hasTitle("focus-playlist")).toBe(true);
    expect(driver.isTracksEmpty("focus-playlist")).toBe(true);
  });

  it("exposes loading and error states through hooks", () => {
    (usePlaylistTracks as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    driver.render();
    expect(driver.isTracksLoading()).toBe(true);

    driver = new PlaylistDetailViewDriver();
    (usePlaylistTracks as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Track service unavailable" },
    });
    driver.render();
    expect(driver.getTrackError()).toBe("Track service unavailable");
  });
});
