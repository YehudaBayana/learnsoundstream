import { LikedInitializerDriver } from "./LikedInitializer.driver";
import { useGetLiked } from "@/features/liked/query/useLiked";
import { useLikedStore } from "@/features/liked/store/useLikedStore";

jest.mock("@/features/liked/query/useLiked");

describe("LikedInitializer", () => {
  beforeEach(() => {
    useLikedStore.setState({
      likedTracks: [],
      isPending: false,
      isError: false,
      refetch: null,
    });
    (useGetLiked as jest.Mock).mockReturnValue({
      data: { pages: [[{ id: "liked-track" }]] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isPending: false,
      refetch: jest.fn(),
    });
  });

  it("renders its configurable root and hydrates the liked store", () => {
    const driver = new LikedInitializerDriver();
    driver.render("liked-store-initializer");
    expect(driver.exists("liked-store-initializer")).toBe(true);
    expect(useLikedStore.getState().likedTracks).toEqual([
      { id: "liked-track" },
    ]);
  });
});
