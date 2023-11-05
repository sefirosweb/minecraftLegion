
import { useStore } from "@/hooks/useStore"
import axios from "axios"

export const useVerifyLoggedIn = () => {
    const setLoged = useStore((state) => state.setLoged)

    const verifyLoggedIn = async () => {
        return axios.get('/api/login')
            .catch((e) => {
                if (e.response.status === 401 || e.response.data.error === 'Not authenticated') {
                    setLoged(false)
                }
            })
    }

    return verifyLoggedIn;
}