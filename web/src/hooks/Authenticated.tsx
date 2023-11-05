import { useVerifyLoggedIn } from "@/utils/useVerifyLoggedIn";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "./useStore";

export const Authenticated = () => {
  const loged = useStore(state => state.loged)
  const verifyLoggedIn = useVerifyLoggedIn();

  useEffect(() => {
    if (!loged) return
    const interval = setTimeout(() => {
      verifyLoggedIn()
    });
    return () => {
      clearInterval(interval)
    }
  }, [])

  return loged ? <Outlet /> : <Navigate to="/login" />;
}

