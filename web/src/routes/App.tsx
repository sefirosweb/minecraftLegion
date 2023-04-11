import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoadingPage } from "@/pages/LoadingPage";
import { Authenticated } from "@/hooks/Authenticated";
import { UnAuthenticated } from "@/hooks/UnAuthenticated";

const Layout = lazy(() => import("../components/Layout").then((module) => ({ default: module.Layout })))
const NotFound = lazy(() => import("../pages/NotFound").then((module) => ({ default: module.NotFound })))
const Dashboard = lazy(() => import("../pages/Dashboard").then((module) => ({ default: module.Dashboard })))
const Masterlist = lazy(() => import("../pages/Masterlist").then((module) => ({ default: module.Masterlist })))
const Chests = lazy(() => import("../pages/Chests").then((module) => ({ default: module.Chests })))
const Portals = lazy(() => import("../pages/Portals").then((module) => ({ default: module.Portals })))
const GeneralConfig = lazy(() => import("../components/configurebot/GeneralConfig").then((module) => ({ default: module.GeneralConfig })))
const ItemsToBeReady = lazy(() => import("../components/configurebot/ItemsToBeReady").then((module) => ({ default: module.ItemsToBeReady })))
const ConfigurebotChests = lazy(() => import("../components/configurebot/ConfigurebotChests").then((module) => ({ default: module.ConfigurebotChests })));
const Combat = lazy(() => import("../components/configurebot/Combat").then((module) => ({ default: module.Combat })))
const GuardJob = lazy(() => import("../components/configurebot/GuardJob").then((module) => ({ default: module.GuardJob })))
const MinerJob = lazy(() => import("../components/configurebot/MinerJob").then((module) => ({ default: module.MinerJob })))
const FarmerJob = lazy(() => import("../components/configurebot/FarmerJob").then((module) => ({ default: module.FarmerJob })))
const BreederJob = lazy(() => import("../components/configurebot/BreederJob").then((module) => ({ default: module.BreederJob })))
const SorterJob = lazy(() => import("../components/configurebot/SorterJob").then((module) => ({ default: module.SorterJob })))
const ProcessList = lazy(() => import("../components/configurebot/ProcessList").then((module) => ({ default: module.ProcessList })))
const FullConfig = lazy(() => import("../components/configurebot/FullConfig").then((module) => ({ default: module.FullConfig })))
const ConfigureBotLayout = lazy(() => import("../components/configurebot/ConfigureBotLayout").then((module) => ({ default: module.ConfigureBotLayout })));
const SelectedBot = lazy(() => import("../hooks/SelectedBot").then((module) => ({ default: module.SelectedBot })))
const Configuration = lazy(() => import('../pages/Configuration').then((module) => ({ default: module.Configuration })))
const Login = lazy(() => import('../pages/Login').then((module) => ({ default: module.Login })))

export const App = () => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>

        <Route index element={<Navigate to={'/login'} />} />

        <Route path='/' element={<UnAuthenticated />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route path='/' element={<Authenticated />}>
          <Route element={<Layout />}>
            <Route path="/configuration" element={<Configuration />} />
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
        </Route>
      </Routes>
    </Suspense>
  );
}