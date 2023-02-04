import { State } from '@/state';
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from "react-router-dom";

const SelectedBot = () => {

  const botState = useSelector((state: State) => state.botsReducer);
  const { botsOnline } = botState

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { selectedSocketId } = configurationState

  if (selectedSocketId === undefined) {
    return <Navigate to="/dashboard" />;
  }

  if (botsOnline.findIndex((e) => { return e.socketId === selectedSocketId }) < 0) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />
}

export default SelectedBot