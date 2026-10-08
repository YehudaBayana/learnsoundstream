import { HistoryViewDriver } from "./HistoryView.driver";
import * as useHistoryModule from "../query/useHistory";

jest.mock("../query/useHistory");
jest.mock("@/features/player/components/TrackItem", () => {
  return function MockTrackItem() {
    return <div data-hook="mock-history-track">History Track</div>;
  };
});

describe("HistoryView Feature Component", () => {
  let driver: HistoryViewDriver;
  const mockRefetch = jest.fn();
  const mockFetchNextPage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    driver = new HistoryViewDriver();
  });

  describe("rendering and empty state", () => {
    it("renders heading and container via driver", () => {
      (useHistoryModule.useHistory as jest.Mock).mockReturnValue({
        data: { pages: [[]] },
        error: null,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isError: false,
        isFetchingNextPage: false,
        isPending: false,
        refetch: mockRefetch,
      });

      driver.render();

      expect(driver.exists()).toBe(true);
      expect(driver.getHeadingText()).toBe("History");
      expect(driver.isEmptyStateVisible()).toBe(true);
    });

    it("shows loading indicator when history query is pending", () => {
      (useHistoryModule.useHistory as jest.Mock).mockReturnValue({
        data: null,
        error: null,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isError: false,
        isFetchingNextPage: false,
        isPending: true,
        refetch: mockRefetch,
      });

      driver.render();

      expect(driver.isLoadingVisible()).toBe(true);
    });
  });

  describe("error state and retry interaction", () => {
    it("shows error message and calls refetch when retry button is clicked", () => {
      (useHistoryModule.useHistory as jest.Mock).mockReturnValue({
        data: null,
        error: { message: "Failed to load user listening history." },
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isError: true,
        isFetchingNextPage: false,
        isPending: false,
        refetch: mockRefetch,
      });

      driver.render();

      expect(driver.isErrorVisible()).toBe(true);
      expect(driver.getErrorText()).toBe("Failed to load user listening history.");

      driver.clickRetry();
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });
});
