import { actionCreators } from "@/state";
import axios from "axios"
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";

export const useVerifyLoggedIn = () => {
    const dispatch = useDispatch();
    const { setLoged } = bindActionCreators(actionCreators, dispatch);

    const verifyLoggedIn = async () => {
        return axios.get('api/login')
            .catch((e) => {
                if (e.response.status === 401 || e.response.data.error === 'Not authenticated') {
                    setLoged(false)
                }
            })
    }

    return verifyLoggedIn;
}