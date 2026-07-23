import { useQuery } from "@tanstack/react-query";
import { getStoreSettings } from "../api/store";

export function useStoreSettings() {
  return useQuery({ queryKey: ["store-settings"], queryFn: getStoreSettings, staleTime: 5 * 60_000 });
}
