import { Routes, Route, Navigate, Router } from "react-router-dom";
import { Authenticated } from "@/hooks/Authenticated";
import { UnAuthenticated } from "@/hooks/UnAuthenticated";
import { Login } from "@/pages/Login";
import { Layout } from "@/components";
import { lazy } from "react";

const Dashboard = lazy(() => import("@/pages/Dashboard").then((module) => ({ default: module.Dashboard })))
const Masterlist = lazy(() => import("@/pages/Masterlist").then((module) => ({ default: module.Masterlist })))
const Chests = lazy(() => import("@/pages/Chests").then((module) => ({ default: module.Chests })))
const Portals = lazy(() => import("@/pages/Portals").then((module) => ({ default: module.Portals })))
const GeneralConfig = lazy(() => import("@/pages/ConfigureBot/GeneralConfig/GeneralConfig").then((module) => ({ default: module.GeneralConfig })))
const ItemsToBeReady = lazy(() => import("@/pages/ConfigureBot/ItemsToBeReady").then((module) => ({ default: module.ItemsToBeReady })))
const ConfigurebotChests = lazy(() => import("@/pages/ConfigureBot/Chests/ConfigurebotChests").then((module) => ({ default: module.ConfigurebotChests })));
const Combat = lazy(() => import("@/pages/ConfigureBot/Combat").then((module) => ({ default: module.Combat })))
const GuardJob = lazy(() => import("@/pages/ConfigureBot/GuardJob").then((module) => ({ default: module.GuardJob })))
const MinerJob = lazy(() => import("@/pages/ConfigureBot/MinerJob").then((module) => ({ default: module.MinerJob })))
const FarmerJob = lazy(() => import("@/pages/ConfigureBot/FarmerJob/FarmerJob").then((module) => ({ default: module.FarmerJob })))
const BreederJob = lazy(() => import("@/pages/ConfigureBot/BreederJob/BreederJob").then((module) => ({ default: module.BreederJob })))
const SorterJob = lazy(() => import("@/pages/ConfigureBot/SorterJob").then((module) => ({ default: module.SorterJob })))
const ProcessList = lazy(() => import("@/pages/ConfigureBot/ProcessList").then((module) => ({ default: module.ProcessList })))
const FullConfig = lazy(() => import("@/pages/ConfigureBot/FullConfig").then((module) => ({ default: module.FullConfig })))
const ConfigureBotLayout = lazy(() => import("@/pages/ConfigureBot/ConfigureBotLayout").then((module) => ({ default: module.ConfigureBotLayout })));
const ConfigurationContext = lazy(() => import("@/pages/ConfigureBot/ConfigurationContext").then((module) => ({ default: module.ConfigurationContextProvider })))
const NotFound = lazy(() => import('@/pages/NotFound').then((module) => ({ default: module.NotFound })))

export const App: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to={'/login'} />} />

      <Route path='/' element={<UnAuthenticated />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path='/' element={<Authenticated />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard/:selectedSocketId?" element={<Dashboard />} />
          <Route path="/masterlist" element={<Masterlist />} />
          <Route path="/chests" element={<Chests />} />
          <Route path="/portals" element={<Portals />} />

          <Route path='/configurebot/:selectedSocketId' element={<ConfigurationContext />}>
            <Route path="" element={<ConfigureBotLayout />}>
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
  );
}