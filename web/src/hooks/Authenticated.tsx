import { State } from "@/state";
import { useVerifyLoggedIn } from "@/utils/useVerifyLoggedIn";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export const Authenticated = () => {
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { loged } = configurationState

  const verifyLoggedIn = useVerifyLoggedIn();

  useEffect(() => {
    if (!loged) return
    const interval = setTimeout(() => {
      verifyLoggedIn()
    });
    return () => {
      clearInterval(interval)
    }
  }, [verifyLoggedIn])

  return loged ? <Outlet /> : <Navigate to="/login" />;
}

