import { State } from "@/state";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export const UnAuthenticated = () => {
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { loged } = configurationState

  return loged ? <Navigate to="/dashboard" /> : <Outlet />;
}

