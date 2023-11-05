import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "./useStore";

export const UnAuthenticated = () => {
  const loged = useStore(state => state.loged)
  return loged ? <Navigate to="/dashboard" /> : <Outlet />;
}

