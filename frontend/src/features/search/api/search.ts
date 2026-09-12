import { apiClient } from "@/api/apiClient";
import { SearchApiResponse } from "@/types/global.types";

export function searchBy(query: string) {
  return apiClient<SearchApiResponse>("/api/search", { params: { q: query } });
}
