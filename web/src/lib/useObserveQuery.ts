import { QueryKey, useQuery } from "@tanstack/react-query";

export const useObserveQuery = <TData = unknown>(queryKey: QueryKey) => {
    return useQuery<TData>({ queryKey, enabled: false });
}