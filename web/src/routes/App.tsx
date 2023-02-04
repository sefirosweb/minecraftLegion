import "bootstrap/dist/css/bootstrap.min.css";
import "../css/general.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import NotFound from "../pages/NotFound"
import Dashboard from "../pages/Dashboard"
import Masterlist from "../pages/Masterlist"
import Chests from "../pages/Chests"
import Portals from "../pages/Portals"
import GeneralConfig from "../components/configurebot/GeneralConfig"
import ItemsToBeReady from "../components/configurebot/ItemsToBeReady"
import ConfigurebotChests from "../components/configurebot/Chests"
import Combat from "../components/configurebot/Combat"
import GuardJob from "../components/configurebot/GuardJob"
import MinerJob from "../components/configurebot/MinerJob"
import FarmerJob from "../components/configurebot/FarmerJob"
import BreederJob from "../components/configurebot/BreederJob"
import SorterJob from "../components/configurebot/SorterJob"
import ProcessList from "../components/configurebot/ProcessList"
import FullConfig from "../components/configurebot/FullConfig"
import ConfigureBotLayout from "../components/configurebot/ConfigureBotLayout"
import Authenticated from "../hooks/Authenticated"
import SelectedBot from "../hooks/SelectedBot"
import Configuration from '../pages/Configuration'

const App = () => {
  return (
    <Layout>
        <Routes>
          <Route path="/configuration" element={<Configuration />} />

          <Route path='/' element={<Authenticated />}>
            <Route path="/" element={<Navigate replace to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/masterlist" element={<Masterlist />} />
            <Route path="/chests" element={<Chests />} />
            <Route path="/portals" element={<Portals />} />

            <Route path='/configurebot' element={<SelectedBot />}>
              <Route path="/configurebot" element={<ConfigureBotLayout />}>
                <Route path="generalconfig" element={<GeneralConfig />} />
                <Route path="itemstobeready" element={<ItemsToBeReady />} />
                <Route path="chests" element={<ConfigurebotChests />} />
                <Route path="combat" element={<Combat />} />
                <Route path="guardjob" element={<GuardJob />} />
                <Route path="minerjob" element={<MinerJob />} />
                <Route path="farmerjob" element={<FarmerJob />} />
                <Route path="breederjob" element={<BreederJob />} />
                <Route path="SorterJob" element={<SorterJob />} />
                <Route path="processlist" element={<ProcessList />} />
                <Route path="full_config" element={<FullConfig />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />

          </Route>

        </Routes>
    </Layout>
  );
}

export default App;
