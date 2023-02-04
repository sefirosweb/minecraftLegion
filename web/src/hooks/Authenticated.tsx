import { State } from "@/state";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const Authenticated = () => {
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { loged } = configurationState

  return loged ? <Outlet /> : <Navigate to="/configuration" />;
}

export default Authenticated
