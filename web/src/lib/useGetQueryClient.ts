import { QueryClient } from "@tanstack/react-query"

let queryClient: QueryClient | undefined

export const useGetQueryClient = () => {
    if (!queryClient) {
        queryClient = new QueryClient()
    }

    return queryClient
}