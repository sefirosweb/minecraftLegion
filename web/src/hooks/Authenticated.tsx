import { State, actionCreators } from "@/state";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { bindActionCreators } from "redux";

export const Authenticated = () => {
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { loged } = configurationState

  const dispatch = useDispatch();
  const { setLoged } = bindActionCreators(actionCreators, dispatch);

  useEffect(() => {
    if (!loged) return
    const interval = setTimeout(() => {
      axios.get('api/login')
        .catch(() => {
          setLoged(false)
        })
    });
    return () => {
      clearInterval(interval)
    }
  }, [])

  return loged ? <Outlet /> : <Navigate to="/login" />;
}

