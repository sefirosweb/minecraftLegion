import { State } from "@/state";
import { useSelector } from "react-redux";

export const useGetMaster = () => {
    const reduce = useSelector((state: State) => state.configurationReducer);
    const { master } = reduce
    return master
}