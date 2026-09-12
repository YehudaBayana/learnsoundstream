import { useQuery } from "@tanstack/react-query";
import { searchKeys } from "@/shared/api/keys";
import { searchBy } from "../api/search";

export function useSearchBy(searchTerm: string) {
  return useQuery({
    queryKey: searchKeys.searchBy(searchTerm),
    queryFn: () => searchBy(searchTerm),
    enabled: searchTerm.length > 0,
  });
}
